import { HttpStatus } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { Request, Response } from "express";
import { findByIdUserService } from "../services/user.service";

const getCurrentUser = asyncHandler( async (req: Request, res: Response) => {
    const userId = req.user?._id

    const user = await findByIdUserService(userId)

    return res
    .status(HttpStatus.OK)
    .json(
        {
            message: "User data fetched successfully!",   
            user
        }
    )
})

export {
    getCurrentUser
}