/*
1. Creates (Signs) JWT Tokens
2. Automatically Sets Default Audience
3. Extracts Secret from Options
4. Merges Configuration Objects
5. Returns Expiration Timestamp (for Access Tokens)
6. Differentiates Token Types
7. Reads Configuration from Environment
8. Provides Type Safety
9. Allows Custom Overrides
10. Exports Reusable Configuration
*/

import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken'
import { Env } from '../config/env.config'

type TimeUnit = "s" | 'm' | 'h' | 'd' | 'w' | "y"
type TimeString = `${number}${TimeUnit}`

export type AccessTokenPayload = {  // payload structure
    userId: string   // data the token will carry
}

// Extends jsonwebtoken's SignOptions to require a secret and optional expiresIn

type SignOptAndSecret = SignOptions & {
    secret: string,
    expiresIn?: TimeString | number
}

const defaults: SignOptions = {
    audience: ["user"]
}

const accessTokenSignOptions: SignOptAndSecret = {
    expiresIn: Env.JWT_EXPIRES_IN as TimeString,
    secret: Env.JWT_SECRET
}

const signJwtToken = (payload: AccessTokenPayload, options?: SignOptAndSecret) => {
    const isAccessToken = !options || options === accessTokenSignOptions;  // This is an access token if the options are missing OR if the options specifically match the access token configuration
    
    const { secret, ...opts } = options || accessTokenSignOptions 

    const token = jwt.sign(
        payload, 
        secret, 
        {
            ...defaults,
            ...opts
        }
    )

    const expireAt = isAccessToken // if the access token is presnt then it will expire at time
    ? (jwt.decode(token) as JwtPayload)?.exp! * 1000 
    : undefined 

    return {
        token,
        expireAt
    }
}

export {
    defaults,
    accessTokenSignOptions,
    signJwtToken
}