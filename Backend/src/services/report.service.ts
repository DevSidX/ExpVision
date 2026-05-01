import mongoose from "mongoose"
import { Report } from "../models/report.model"
import { ReportSettings } from "../models/reportSettings.model"
import { Transaction, TransactionTypeEnum } from "../models/transaction.model"
import { NotFoundException } from "../utils/ApiError"
import { calculateNextReportDate } from "../utils/calculateNextReportDate"
import { updateReportSettingsType } from "../validators/report.validator"
import { convertPaiseToRupee } from "../utils/formatCurrency"
import { format } from "date-fns/format"
import { genAi, genAiModel } from "../config/google-Ai.config"
import { createUserContent } from "@google/genai"
import { reportInsightsPrompt } from "../utils/prompt.utils"

const getAllReportsService = async (
    userId: string , 
    pagination: {
        pageSize: number,
        pageNumber: number
    }
) => {
    const query: Record<string, any> = { userId } // Start query with userId, then add more filters later.

    const { pageSize, pageNumber } = pagination
    const skip = (pageNumber - 1) * pageSize

    const [ reports, totalCount ] = await Promise.all(  // reports and total count stores the results
        [
            Report.find(query)
                .skip(skip)
                .limit(pageSize)
                .sort({ createdAt: -1 }),  // reports promice

            Report.countDocuments(query)  // total count promice
        ]
    )

    const totalPages = Math.ceil( totalCount / pageSize )

    return {
        reports,
        pagination: {
            pageSize,
            pageNumber,
            totalCount,
            totalPages
        },
    }
}

const updateReportSettingsService = async (userId: string, body: updateReportSettingsType) => {
    const { isEnabled } = body
    let nextReportDate: Date | null = null

    const existingReportsSettings = await ReportSettings.findOne({ userId })

    if(!existingReportsSettings){
        throw new NotFoundException("Report settings not found!");
    }

    if(isEnabled){
        const currentNextReportsDate = existingReportsSettings.nextReportDate

        const now = new Date()

        if(!currentNextReportsDate || currentNextReportsDate <= now){
            nextReportDate = calculateNextReportDate(existingReportsSettings.lastSentDate)
        } else {
            nextReportDate = currentNextReportsDate
        }
    }

    console.log(nextReportDate, "next Report Date");
    
    existingReportsSettings.set({
        ...body,
        nextReportDate
    })

    await existingReportsSettings.save()
}

const generateReportService = async (userId: string ,fromDate: Date ,toDate: Date) => {
    const result = await Transaction.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                date: { // if(fromDate <= date <= toDate)
                    $gte: fromDate, // greater than equal
                    $lte: toDate  // less than equal
                }
            }
        },
        {
            $facet: {  // allows you to run multiple, independent aggregation sub-pipelines on the same set of input documents within a single stage
                summary: [
                    {
                        $group: {
                            _id: null,
                            totalIncome: {
                                $sum: { 
                                    $cond : [ // if (type === INCOME) return abs else return 0
                                        {
                                            $eq: ["$type", TransactionTypeEnum.INCOME] // eq = equal
                                        },
                                        {
                                            $abs: "$amount"
                                        },
                                        0
                                    ]
                                } 
                            },
                            totalExpense: {
                                $sum: { 
                                    $cond : [ // if (type === INCOME) return abs else return 0
                                        {
                                            $eq: ["$type", TransactionTypeEnum.EXPENSE] // eq = equal
                                        },
                                        {
                                            $abs: "$amount"
                                        },
                                        0
                                    ]
                                } 
                            }
                        }
                    }
                ],
                categories: [
                    {
                        $match: {
                            type: TransactionTypeEnum.EXPENSE
                        }
                    },
                    {
                        $group: {
                            _id: "$category",
                            total: {
                                $sum: {
                                    $abs: "$amount"
                                }
                            }
                        }
                    },
                    {
                        $sort: { total: -1 },
                    },
                    {
                        $limit: 5,
                    }        
                ]
            }
        },
        {
            $project: {
                totalIncome: {
                    $arrayElemAt: ["$summary.totalIncome", 0] 
                },
                totalExpense: {
                    $arrayElemAt: ["$summary.totalExpense", 0]
                },
                categories: 1,
            }
        }
    ])

    if (!result?.length || result[0]?.totalIncome === 0 && result[0]?.totalExpense === 0) {
        return null;
    }
    const { totalIncome = 0, totalExpense = 0, categories = [] } = result[0] || {}  // default zero

    const availableBalance = totalIncome - totalExpense;

    const savingsRate = calculateSavingsRate(totalIncome, totalExpense);

    const byCategory = categories.reduce((accu: any, { _id, total }: any) => {
        accu[_id] = {
            amount: convertPaiseToRupee(total),
            percentage: totalExpense > 0 ? Math.round((total / totalExpense) * 100) : 0
        }

        return accu
    }, {} as Record<string, {amount: number, percentage: number}>
    )

    const periodLabel = `${format(fromDate, "MMMM d")} - ${format(toDate, "d yyyy")}` // April 14-30, 2026

    // insights

    const insights = await generateInsightsAI({
        totalIncome,
        totalExpense,
        availableBalance,
        savingsRate,
        categories: byCategory,
        periodLabel: periodLabel
    })

    
    return {
        period: periodLabel,
        summary: {
            income: convertPaiseToRupee(totalIncome),
            expense: convertPaiseToRupee(totalExpense),
            balance: convertPaiseToRupee(availableBalance),
            savingsRate: Number(savingsRate.toFixed(1)),
            topCategories: Object.entries(byCategory).map(
                (([name, category]: any) => ({
                    name,
                    amount: category.amount,
                    percentage: category.percentage
                }))
            )
        },
        insights,
    }
}


function calculateSavingsRate(totalIncome: number , totalExpense: number) {
    if(totalIncome <= 0){
        return 0
    }
    const savingsRate = ((totalIncome - totalExpense) / totalIncome ) * 100
    return parseFloat(savingsRate.toFixed(2))
}

async function generateInsightsAI({
    totalIncome,
    totalExpense,
    availableBalance,
    savingsRate,
    categories,
    periodLabel
}: {  // types
    totalIncome: number,
    totalExpense: number,
    availableBalance: number,
    savingsRate: number,
    categories: Record<string, {amount: number, percentage: number}>,
    periodLabel: string
}) {
    try {
        const prompt = reportInsightsPrompt({
            totalIncome: convertPaiseToRupee(totalIncome),
            totalExpense: convertPaiseToRupee(totalExpense),
            availableBalance: convertPaiseToRupee(availableBalance),
            savingsRate: Number(savingsRate.toFixed(1)),
            categories,
            periodLabel
        })

        const result = await genAi.models.generateContent({
            model: genAiModel,
            contents: [ createUserContent([prompt]) ],
            config: {
                responseMimeType: "application/json"
            },
        })

        const response = result.text

        // console.log(response);
        
        const cleanedText = response?.replace(/```(?:json)?\n?/g, "").trim()

        if(!cleanedText) return [];

        const data = JSON.parse(cleanedText)

        return data
    } catch (error) {
        return [];
    }
}

export {
    getAllReportsService,
    updateReportSettingsService,
    generateReportService
}