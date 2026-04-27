import { Report } from "../models/report.model"
import { ReportSettings } from "../models/reportSettings.model"
import { NotFoundException } from "../utils/ApiError"
import { calculateNextReportDate } from "../utils/calculateNextReportDate"
import { updateReportSettingsType } from "../validators/report.validator"

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

    existingReportsSettings.set({
        ...body,
        nextReportDate
    })

    await existingReportsSettings.save()
}

export {
    getAllReportsService,
    updateReportSettingsService
}