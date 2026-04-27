import { Router } from "express";
import { getAllReports, updateReportSettings } from "../controllers/report.controller";
import { passportAuthenticateJwt } from "../config/passport.config";

const router = Router()

router.use(passportAuthenticateJwt)

router.route("/all").get(
    getAllReports
)

router.route("/update-setting").put(
    updateReportSettings
)

export default router