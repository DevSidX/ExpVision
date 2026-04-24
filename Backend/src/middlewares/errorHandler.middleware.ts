import { ErrorRequestHandler } from "express";
import { HttpStatus } from "../config/http.config";
import { ApiError } from "../utils/ApiError";
import { ZodError, z } from "zod";
import { Response } from "express";
import { MulterError } from "multer";
import { ErrorCodeEnum } from "../enums/error-code.enum";

// it converts Zod’s verbose validation errors into a simple, consistent format your API can return.
const formatZodError = (res: Response, err: ZodError) => {
    const errors = err?.issues?.map((error) => ({
        field: error.path.join("."),
        message: error.message
    }))
}

const handleMulterError = (err: MulterError) => {
    const messages = {
        LIMIT_UNEXPECTED_FILE: "Invalid file field name. Please use 'file'",
        LIMIT_FILE_SIZE: "File size exceeds the limit",
        LIMIT_FILE_COUNT: "Too many files uploaded"
    }

    return {
        status: HttpStatus.BAD_REQUEST,
        message: messages[err.code as keyof typeof messages],
        error: err.message 
    }
}

const errorHandler: ErrorRequestHandler = (err, req, res, next): any => {
    console.log("Error occured on PATH:", err);

    if(err instanceof ZodError){
        return formatZodError(res, err)
    }

    if (err instanceof MulterError) {
        const { status, message, error } = handleMulterError(err)
        return res
        .status(status)
        .json(
            {
                message,
                error: error,
                errorCode: ErrorCodeEnum.FILE_UPLOAD_ERROR
            }
        )
    }

    if(err instanceof ApiError){
        return res
        .status(err.statusCode)
        .json(
            {
                message: err.message,
                error: err.errorCode
            }
        )
    }

    return res
    .status(HttpStatus.INTERNAL_SERVER_ERROR)
    .json(
        {
            message: "Internal Server Error",
            error: err?.message || "An unexpected error occurred."
        }
    )
}

export {
    errorHandler
}