import { Router } from "express";
import { getCurrentUser } from "../controllers/user.controller";
import { passportAuthenticateJwt } from "../config/passport.config";

const router = Router()

router.route("/current-user").get(
    passportAuthenticateJwt,
    getCurrentUser
)

export default router