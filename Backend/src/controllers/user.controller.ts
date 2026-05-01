import { HttpStatus } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { Request, Response } from "express";
import { findByIdUserService, updateUserService } from "../services/user.service";
import { updateUserschema } from "../validators/user.validator";

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

const updateUser = asyncHandler( async (req: Request, res: Response) => {
    const body = updateUserschema.parse(req.body)

    const userId = req.user?._id

    const profilePic = req.file

    const update = await updateUserService(userId, body, profilePic)

    return res
    .status(HttpStatus.OK)
    .json(
        {
            message: "User profile updated successfully!",
            data: update
        }
    )
})

export {
    getCurrentUser,
    updateUser
}