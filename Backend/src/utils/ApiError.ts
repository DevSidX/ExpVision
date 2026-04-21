import { HttpStatusCodeType } from "../config/http.config"
import { ErrorCodeEnum, ErrorCodeEnumType } from "../enums/error-code.enum"
import { HttpStatus } from "../config/http.config"

class ApiError extends Error {

    public statusCode: HttpStatusCodeType
    public errorCode?: ErrorCodeEnumType

    constructor(
        message: string,
        errorCode?: ErrorCodeEnumType,
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR
    ){
        super(message)
        this.statusCode = statusCode
        this.errorCode = errorCode

        Error.captureStackTrace(this, this.constructor)
    }
}

class HttpException extends ApiError {
    constructor(
        message = "Http Exception error",
        statusCode: HttpStatusCodeType,
        errorCode?: ErrorCodeEnumType
    ){
        super(
            message,
            errorCode,
            statusCode
        )
    }
}

class NotFoundException extends ApiError {

    constructor(
        message = "Resource not found",
        errorCode?: ErrorCodeEnumType
    ){
        super(
            message,
            errorCode || ErrorCodeEnum.RESOURCE_NOT_FOUND,
            HttpStatus.NOT_FOUND,
        )
    }
}

class BadRequestException extends ApiError {
    constructor(
        message = "Bad Request",
        errorCode?: ErrorCodeEnumType
    ){
        super(
            message,
            errorCode || ErrorCodeEnum.VALIDATION_ERROR,
            HttpStatus.BAD_REQUEST,
        )
    }
}

class UnauthorizedException extends ApiError {
    constructor(
        message = "Unauthorized",
        errorCode?: ErrorCodeEnumType
    ){
        super(
            message,
            errorCode || ErrorCodeEnum.ACCESS_UNAUTHORIZED,
            HttpStatus.UNAUTHORIZED,
        )
    }
}

class InternalServerException extends ApiError{
    constructor(
        message = "Internal Server Error",
        errorCode?: ErrorCodeEnumType
    ){
        super(
            message,
            errorCode || ErrorCodeEnum.INTERNAL_SERVER_ERROR,
            HttpStatus.INTERNAL_SERVER_ERROR
        )
    }
}    

export { 
    ApiError, 
    HttpException,
    NotFoundException, 
    BadRequestException, 
    UnauthorizedException, 
    InternalServerException 
}