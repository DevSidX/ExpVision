import { endOfMonth } from "date-fns/endOfMonth"
import { startOfMonth } from "date-fns/startOfMonth"
import { subMonths } from "date-fns/subMonths"
import { ReportSettings } from "../../models/reportSettings.model"
import { userDocument } from "../../models/user.model"
import mongoose from "mongoose"
import { generateReportService } from "../../services/report.service"
import { Report, ReportStatusEnum } from "../../models/report.model"
import { calculateNextReportDate } from "../../utils/calculateNextReportDate"
import { format } from 'date-fns'
import { sendReportEmail } from "../../mailers/report.mailer"

// automate monthly report delivery for users.

const processReportJob = async () => {
    const now = new Date()

    let processedCount = 0
    let failedCount = 0

    const from = startOfMonth(subMonths(now , 1)) // starting day of the current month like 00:00:00
    const to = endOfMonth(subMonths(now, 1))

    // const from = ""
    // const to = ""

    try {
        // find all the users whose reports scheduling is enabled and next report is due right now and also load their full user details
        const reportSettingCursor = ReportSettings.find({ 
            isEnabled: true,
            nextReportDate: { $lte: now }  // less then equal to
        })
        .populate<{userId: userDocument}>("userId") // populate() is used to fetch the full referenced document
        .cursor()

        console.log("Running report");

        for await(const settings of reportSettingCursor){ // all the finded documents after query
            const user = settings.userId as userDocument

            if(!user){
                console.log(`User not found for settings: ${settings._id}`);
                continue;
            }

            const session = await mongoose.startSession();

            try {
                // Builds report data for this user for selected date range.
                const report = await generateReportService(user.id, from, to)

                console.log(report, "report data");
                
                let emailSent = false

                if(report){
                    try {  // send email
                        await sendReportEmail({
                            email: user.email!,
                            username: user.name!,
                            report: {
                                period: report.period,
                                totalIncome: report.summary.income,
                                totalExpence: report.summary.expense,
                                availableBalance: report.summary.balance,
                                savingsRate: report.summary.savingsRate,
                                topSpendingCategories: report.summary.topCategories,
                                insights: report.insights,
                            },
                            frequency: settings.frequency!
                        })
                        emailSent = true
                    } catch (error) {
                        console.log(`Email failed for ${user.id}`);
                    }
                }

                // 1. Insert report record into Report
                // 2. Update next report date in ReportSettings

                await session.withTransaction( async () => {
                    const bulkReports: any[] = []
                    const bulkSettings: any[] = []

                    if(report && emailSent){
                        bulkReports.push({
                            insertOne: {
                                document: {
                                    userId: user.id,
                                    sentDate: now,
                                    period: report.period,
                                    status: ReportStatusEnum.SENT,
                                    createdAt: now,
                                    updatedAt: now
                                }
                            }
                        })

                        bulkSettings.push({
                            updateOne: {
                                filter: {
                                    _id: settings._id,
                                },
                                update: {
                                    $set: {
                                        lastSentDate: now,
                                        nextReportDate: calculateNextReportDate(now),
                                        updatedAt: now
                                    }
                                },
                            }
                        })
                    } else {
                        bulkReports.push({
                            insertOne: {
                                document: {
                                    userId: user.id,
                                    sentDate: now,
                                    period: report?.period || `${format (from, "MMMM d")} - ${format (to, "d yyyy")}`,
                                    status: report ? ReportStatusEnum.FAILED : ReportStatusEnum.NO_ACTIVITY,
                                    createdAt: now,
                                    updatedAt: now
                                }
                            }
                        })

                        bulkSettings.push({
                            updateOne: {
                                filter: {
                                    _id: settings._id,
                                },
                                update: {
                                    $set: {
                                        lastSentDate: null,
                                        nextReportDate: calculateNextReportDate(now),
                                        updatedAt: now
                                    }
                                },
                            }
                        })
                    }

                    // runs both Db operations parallely
                    await Promise.all([
                        Report.bulkWrite(
                            bulkReports, 
                            { 
                                ordered: false 
                            }
                        ),
                        ReportSettings.bulkWrite(
                            bulkSettings, 
                            { 
                                ordered: false 
                            }
                        )
                    ])
                },
            {
                maxCommitTimeMS: 10000 // max 10 sec
            })
            processedCount++;

            } catch (error) {
                console.log(`Failed to process report `, error);
                failedCount++;
            } finally {
                await session.endSession();
            }
        }

        console.log(`✅ Processed: ${processedCount} report`);
        console.log(`❌ Failed: ${failedCount} report`);
        
        return {
            success: true,
            processedCount,
            failedCount
        }
        
    } catch (error) {
        console.error("Error processing reports", error)
        return {
            success: false,
            error: "Reports process failed!"
        }
    }
}

export {
    processReportJob
}