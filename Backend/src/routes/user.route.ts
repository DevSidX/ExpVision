import { Router } from "express";
import { getCurrentUser, updateUser } from "../controllers/user.controller";
import { passportAuthenticateJwt } from "../config/passport.config";
import { uploadOnCloudinary } from "../config/cloudinary.config";

const router = Router()

router.route("/current-user").get(
    passportAuthenticateJwt,
    getCurrentUser
)

router.route("/update").put(
    passportAuthenticateJwt,
    uploadOnCloudinary.single("profilePicture"),
    updateUser
)

export default router