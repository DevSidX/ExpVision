import { User } from "../models/user.model"
import { NotFoundException } from "../utils/ApiError"
import { updateUserType } from "../validators/user.validator"

const findByIdUserService = async (userId: string) => {
    const user = await User.findById(userId)

    return user?.omitPassword()
}

const updateUserService = async(userId: string, body: updateUserType, profilePic?: Express.Multer.File | null) => {
    const user = await User.findById(userId)

    if(!user){
        throw new NotFoundException("User not found!")
    }

    if(profilePic){
        user.profilePicture = profilePic.path
    }

    user.set({
        name: body.name
    });

    await user.save();
    return user.omitPassword()
}

export {
    findByIdUserService,
    updateUserService
}