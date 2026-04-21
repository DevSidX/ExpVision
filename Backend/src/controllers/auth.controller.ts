import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { User } from "../models/user.model";
import { Request, Response } from "express";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { HttpStatus } from "../config/http.config";
import { loginService, registerService } from "../services/auth.service";


const register = asyncHandler( async (req: Request, res: Response) => {
    // const { name, email, password } = req.body // dont need this because have already used in auth.validators
    const body = registerSchema.parse(req.body)  // this already ha name, email , password
    
    const result = await registerService(body)
    return res
    .status(HttpStatus.CREATED)
    .json(
        {
            message: "User registered successfully!",
            data: result
        }
    )
})

const login = asyncHandler( async ( req: Request, res: Response) => {
    const body = loginSchema.parse({ ...req.body })

    const { user, accessToken, expireAt, reportSettings } = await loginService(body)

    return res
    .status(HttpStatus.ACCEPTED)
    .json(
        {
            message: "User logged in successfully!",
            user,
            accessToken,
            expireAt,
            reportSettings
        }
    )
})

export {
    register,
    login
}