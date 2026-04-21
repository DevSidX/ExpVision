// res.status(404) ❌
// res.status(HttpStatus.NOT_FOUND)  ✅

const httpConfig = () => ({
    // success responses
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,

    // client errors responses
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUEST: 429,
    
    // server errors responses
    INTERNAL_SERVER_ERROR: 500,       
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
})

export const HttpStatus = httpConfig()

export type HttpStatusCodeType = (typeof HttpStatus)[keyof typeof HttpStatus];  // creates a type that only allows valid HTTP status codes from your HttpStatus object.