import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HttpStatus } from "../config/http.config";
import { generateReportService, getAllReportsService, updateReportSettingsService } from "../services/report.service";
import { updateReportSettingsSchema } from "../validators/report.validator";

const getAllReports = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id

    const pagination = {
        pageSize: parseInt(req.query.pageSize as string) || 20,
        pageNumber: parseInt(req.query.pageNumber as string) || 1
    }

    const result = await getAllReportsService(userId, pagination)

    return res
    .status(HttpStatus.OK)
    .json(
        {
            message: "All reports history fetched successfully!",
            ...result
        }
    )
})

const updateReportSettings = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id

    const body = updateReportSettingsSchema.parse(req.body)
    
    await updateReportSettingsService(userId, body)

    return res
    .status(HttpStatus.OK)
    .json(
        {
            message: "Report settings updated successfully!",
        }
    )
})

const generateReport = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?._id

    const { from, to } = req.query
    const fromDate = new Date(from as string)
    const toDate = new Date(to as string)

    const report = await generateReportService(userId, fromDate, toDate)

    return res
    .status(HttpStatus.OK)
    .json(
        {
            message: "Report generated successfully!",
            ...report
        }
    )
})



export {
    getAllReports,
    updateReportSettings,
    generateReport
}