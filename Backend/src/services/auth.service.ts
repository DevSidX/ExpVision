import mongoose from "mongoose";
import { User } from "../models/user.model";
import { NotFoundException, UnauthorizedException } from "../utils/ApiError";
import { loginSchemaType, registerSchemaType } from "../validators/auth.validator";
import { ReportFrequencyEnum, ReportSettings } from "../models/reportSettings.model";
import { calculateNextReportDate } from "../utils/calculateNextReportDate";
import { signJwtToken } from "../utils/jwt";

const registerService = async (body: registerSchemaType) => {
    const { email } = body

    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
    
        const userExist = await User.findOne({ email }).session(session)

        if(userExist) {
            throw new UnauthorizedException("User Already Exist with this email!")
        }

        const newUser = new User({
            ...body
        })

        const reportSettings = new ReportSettings({
            userId: newUser._id,
            frequency: ReportFrequencyEnum.MONTHLY,
            isEnabled: true,
            nextReportDate: calculateNextReportDate (),
            lastSentDate: null,
        });

        await newUser.save({ session })  
        await reportSettings.save({ session }) 
        
        return {
            user: newUser.omitPassword()
        }
    })
    } catch (error) {
        throw error
    } finally {
        await session.endSession()
    }
}

const loginService = async (body: loginSchemaType) => {
    const { email, password } = body

    const user = await User.findOne({ email })

    if(!user){
        throw new NotFoundException("Email / Password not found!");
    }

    const isPasswordValid = await user.comparePassword(password)
    
    if(!isPasswordValid){
        throw new UnauthorizedException("Invalid password!");
    }

    const { token, expireAt } = signJwtToken({ userId: user.id })

    const reportSettings = await ReportSettings.findOne(
    {
        userId: user.id
    },
    { // $Project - find this userid and return id, frequency, isEnabled
        _id: 1,
        frequency: 1,
        isEnabled: 1
    }).lean()

    return {
        user: user.omitPassword(),
        accessToken: token,
        expireAt,
        reportSettings
    }
}

export {
    registerService,
    loginService
}