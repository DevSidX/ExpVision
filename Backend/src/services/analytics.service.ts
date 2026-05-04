import mongoose from "mongoose"
import { DateRangeEnum, DateRangePreset } from "../enums/date-range.enum"
import { Transaction, TransactionTypeEnum } from "../models/transaction.model"
import { getDateRange } from "../utils/date"
import { differenceInDays, subDays, subYears } from "date-fns"
import { convertPaiseToRupee } from "../utils/formatCurrency"


const summaryAnalyticsService = async (
    userId: string, 
    dateRangePreset?: DateRangePreset, 
    customFrom?: Date, 
    customTo?: Date
) => {
    const range = getDateRange(dateRangePreset, customFrom, customTo)

    const { from, to, value: rangeValue } = range

    const currentPeriodPipeline: any[] = [
        {  // userId must match and date must be between from and to (only if both exist)
            $match: {  
                userId: new mongoose.Types.ObjectId(userId),
                ...(from && to && { 
                    date: {
                        $gte: from, // greater then equal
                        $lte: to  // less then equal
                    }
                })
            }            
        },
        {
            $group: {
                _id: null,
                totalIncome: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", TransactionTypeEnum.INCOME] },
                            { $abs: "$amount" },
                            0
                        ]
                    }
                },
                totalExpence: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", TransactionTypeEnum.EXPENSE] },
                            { $abs: "$amount" },
                            0
                        ]
                    }
                },
                transactionCount: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                totalIncome: 1,
                totalExpence: 1,
                transactionCount: 1,

                availableBalance: {
                    $subtract: [ "$totalIncome" , "$totalExpence"] // total income - totalExpence
                },

                savingsData: {
                    $let: {
                        vars: {
                            income: {
                                $ifNull: ["$totalIncome", 0]
                            },
                            expence: {
                                $ifNull: ["$totalExpence", 0]
                            }
                        },
                        in: { // if income is less then equal to 0 then the savingpercentage is 0
                            savingPercentage: {
                                $cond: [
                                    { $lte: [ "$$income", 0 ] },
                                    0,
                                    {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    {
                                                        $subtract: ["$$income", "$$expence"] // subtract expense from income
                                                    },
                                                    "$$income" // divide by orignal income
                                                ]
                                            },
                                            100 // multiply by hundred
                                        ]
                                    }
                                ]
                            },
                            // expence ratio = ( expence / income ) * 100
                            expenceRatio: {
                                $cond: [
                                    { $lte: [ "$$income", 0 ] }, // if the income is not less then and equal to 0
                                    0,
                                    {
                                        $multiply: [
                                            {
                                                $divide: ["$$expence", "$$income"], 
                                            },
                                            100
                                        ]
                                    }
                                ]
                            }
                        
                        }
                    }
                }
            }
        }
    ]

    const [ current ] = await Transaction.aggregate(currentPeriodPipeline)

    const { 
        totalIncome = 0, 
        totalExpence = 0, 
        transactionCount = 0, 
        availableBalance = 0, 
        savingsData = {
            expenceRatio: 0,
            savingPercentage: 0
        } 
    } = current || {} // destructuring values from the current object

    console.log("current ->", current);
    

    let percentageChange: any = {
        income: 0,
        expence: 0,
        balance: 0,
        prevPeriodFrom: null,
        prevPeriodTo: null,
        prevValues: {
            incomeAmount: 0,
            expenceAmount: 0,
            balanceAmount: 0
        }
    }

    // If from and to dates exist, and range is not ALL_TIME, calculate how many days are in the selected range, then go backward by the same number of days to get the previous comparison period.
    if(from && to && rangeValue !== DateRangeEnum.ALL_TIME){
        
        const period = differenceInDays(to, from) + 1;

        console.log(`${differenceInDays(to, from)}`, period, "period");

        const isYearly = [    // checks whether selected range is a year-based range.
            DateRangeEnum.LAST_YEAR,
            DateRangeEnum.THIS_YEAR
        ].includes(rangeValue)

        const prevPeriodFrom = isYearly ? subYears(from, 1) : subDays(from, period)

        const prevPeriodTo = isYearly ? subYears(to, 1) : subDays(to, period)

        console.log(prevPeriodFrom, prevPeriodTo, "Prev date");

        const prevPeriodPipeline = [
            {
                $match: {  
                userId: new mongoose.Types.ObjectId(userId),
                date: {
                    $gte: prevPeriodFrom, // greater then equal
                    $lte: prevPeriodTo  // less then equal
                }}
            },
            {
                $group: {
                    _id: null,
                    totalIncome: {
                        $sum: {
                            $cond: [
                                { $eq: ["$type", TransactionTypeEnum.INCOME] },
                                { $abs: "$amount" },
                                0
                            ]
                        }
                    },
                    totalExpence: {
                        $sum: {
                            $cond: [
                                { $eq: ["$type", TransactionTypeEnum.EXPENSE] },
                                { $abs: "$amount" },
                                0
                            ]
                        }
                    },
                }
            }
        ]

        const [previous] = await Transaction.aggregate(prevPeriodPipeline)
        console.log(previous, "Previous data");

        if(previous) {
            const prevIncome = previous.totalIncome || 0
            const prevExpence = previous.totalExpence || 0
            const prevBalance = prevIncome - prevExpence

            const currIncome = totalIncome
            const currExpence = totalExpence
            const currBalance = availableBalance

            percentageChange = {
                income: calcPercentageChange(prevIncome, currIncome),
                expence: calcPercentageChange(prevExpence, currExpence),
                balance: calcPercentageChange(prevBalance, currBalance),
                prevPeriodFrom: prevPeriodFrom,
                prevPeriodTo: prevPeriodTo,
                prevValues: {
                    incomeAmount: prevIncome,
                    expenceAmount: prevExpence,
                    balanceAmount:  prevBalance
                }
            }
        }
    }

    return {
        availableBalance: convertPaiseToRupee(availableBalance),
        totalIncome: convertPaiseToRupee(totalIncome),
        totalExpence: convertPaiseToRupee(totalExpence),
        savingRate: {
            percentage: parseFloat(savingsData.savingPercentage.toFixed(2)),
            expenceRatio: parseFloat(savingsData.expenceRatio.toFixed(2)),
        },
        transactionCount,
        percentageChange: {
            ...percentageChange,
            prevValues: {
                incomeAmount: convertPaiseToRupee(percentageChange.prevValues.incomeAmount),
                expenceAmount: convertPaiseToRupee(percentageChange.prevValues.expenceAmount),
                balanceAmount: convertPaiseToRupee(percentageChange.prevValues.balanceAmount)
            }
        },
        preset: {
            ...range,
            value: rangeValue || DateRangeEnum.ALL_TIME,
            label: range?.label || "All Time"
        }
    }
}

function calcPercentageChange (prev: number, curr: number) {
    if (prev === 0) {
        return curr === 0 ? 0 : 100
    }

    const changes = ((curr - prev) / Math.abs(prev) * 100)

    const cappedChanges = Math.min(Math.max(changes, -100), 100)  // always stays between -500 and 500.

    return parseFloat(cappedChanges.toFixed(2))
}

export {
    summaryAnalyticsService
}