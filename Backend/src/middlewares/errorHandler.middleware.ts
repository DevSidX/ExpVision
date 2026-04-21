import { ErrorRequestHandler } from "express";
import { HttpStatus } from "../config/http.config";
import { ApiError } from "../utils/ApiError";
import { ZodError, z } from "zod";
import { Response } from "express";

// it converts Zod’s verbose validation errors into a simple, consistent format your API can return.
const formatZodError = (res: Response, err: ZodError) => {
    const errors = err?.issues?.map((error) => ({
        field: error.path.join("."),
        message: error.message
    }))
}

const errorHandler: ErrorRequestHandler = (err, req, res, next): any => {
    console.log("Error occured on PATH:", err);

    if(err instanceof ZodError){
        return formatZodError(res, err)
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