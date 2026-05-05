import { Router } from "express";
import { chartAnalytics, expencePieChartBreakdown, summaryAnalytics } from "../controllers/analytics.controller";
import { passportAuthenticateJwt } from "../config/passport.config";

const router = Router()

router.use(passportAuthenticateJwt)

router.route("/summary").get(
    summaryAnalytics
)

router.route("/chart").get(
    chartAnalytics
)

router.route("/expenceBreakdown").get(
    expencePieChartBreakdown
)

export default router