import { Router } from "express";
import { summaryAnalytics } from "../controllers/analytics.controller";
import { passportAuthenticateJwt } from "../config/passport.config";

const router = Router()

router.use(passportAuthenticateJwt)

router.route("/summary").get(
    summaryAnalytics
)

export default router