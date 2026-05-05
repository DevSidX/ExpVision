import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HttpStatus } from "../config/http.config";
import { DateRangePreset } from "../enums/date-range.enum";
import { chartAnalyticsService, expencePieChartBreakdownService, summaryAnalyticsService } from "../services/analytics.service";

const summaryAnalytics = asyncHandler( async (req: Request, res: Response) => {
    const userId = req.user?._id

    const { preset, from, to } = req.query

    const filter = {
        dateRangePreset: preset as DateRangePreset,  // today, last7 days, last30 days
        customFrom: from ? new Date(from as string) : undefined, // So fetch records from this date onward.
        customTo: to ? new Date(to as string) : undefined // only return records inside this date range
    }

    const stats = await summaryAnalyticsService(userId, filter.dateRangePreset, filter.customFrom, filter.customTo)

    return res
    .status(HttpStatus.OK)
    .json(
        {
            message: "Summary Analytics fetched successfully!",
            data: stats
        }
    )
})

const chartAnalytics = asyncHandler( async (req: Request, res: Response) => {
    const userId = req.user?._id

    const { preset, from, to } = req.query

    const filter = {
        dateRangePreset: preset as DateRangePreset,  // today, last7 days, last30 days
        customFrom: from ? new Date(from as string) : undefined, // So fetch records from this date onward.
        customTo: to ? new Date(to as string) : undefined // only return records inside this date range
    }

    const chartData = await chartAnalyticsService(userId, filter.dateRangePreset, filter.customFrom, filter.customTo)

    return res
    .status(HttpStatus.OK)
    .json(
        {
            message: "Chart fetched successfully!",
            data: chartData
        }
    )
})

const expencePieChartBreakdown = asyncHandler( async (req: Request, res: Response) => {
    const userId = req.user?._id

    const { preset, from, to } = req.query

    const filter = {
        dateRangePreset: preset as DateRangePreset,  // today, last7 days, last30 days
        customFrom: from ? new Date(from as string) : undefined, // So fetch records from this date onward.
        customTo: to ? new Date(to as string) : undefined // only return records inside this date range
    }

    const chartData = await expencePieChartBreakdownService(userId, filter.dateRangePreset, filter.customFrom, filter.customTo)

    return res
    .status(HttpStatus.OK)
    .json(
        {
            message: "Expence breakdown fetched successfully!",
            data: chartData
        }
    )
})



export {
    summaryAnalytics,
    chartAnalytics,
    expencePieChartBreakdown
}