import passport from 'passport'
import { Env } from './env.config'
import { Strategy as jwtStratrgy, ExtractJwt, StrategyOptions } from 'passport-jwt'
import { findByIdUserService } from '../services/user.service'

interface JwtPayload {
    userId: string
}

// this ensures token authenticity + security
const options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),  // Extract token from header
    secretOrKey: Env.JWT_SECRET,  // Used to verify token signature
    audience: ["user"],  // Ensures token is meant for "user"
    algorithms: ["HS256"]  // Only accept HS256 tokens
}

// after token is verified
passport.use(
    new jwtStratrgy(options, async (payload: JwtPayload, done) => {
        try {
            if (!payload.userId) {
                return done(
                    null, 
                    false, 
                    {
                        message: "Invalid token payload"
                    }
                )
            }
            const user = await findByIdUserService(payload.userId)
            if(!user){
                return done(null,false)
            }
            return done(null,user)

        } catch (error) {
            return done(error,false)
        }
    })
)

// When a user logs in, store this user object in the session
passport.serializeUser((user: any, done) => done(
    null,
    user
))

// Take the data stored in the session and attach it back to req.user
passport.deserializeUser((user: any, done) => done(
    null,
    user
))

// middleware that protects routes using your JWT strategy.
const passportAuthenticateJwt = passport.authenticate(
    "jwt",
    {
        session: false
    }
)

export {
    passportAuthenticateJwt
}