import { Router } from "express";
import { generateReport, getAllReports, updateReportSettings } from "../controllers/report.controller";
import { passportAuthenticateJwt } from "../config/passport.config";

const router = Router()

router.use(passportAuthenticateJwt)

router.route("/all").get(
    getAllReports
)

router.route("/update-setting").put(
    updateReportSettings
)

router.route("/generate").get(
    generateReport
)



export default router