import dotenv from "dotenv";
dotenv.config();
import './config/passport.config'
import { Env } from './config/env.config'
import express, { NextFunction , Request, Response} from 'express'
import cors from 'cors'
import { HttpStatus } from './config/http.config'
import { errorHandler } from "./middlewares/errorHandler.middleware"
import { BadRequestException } from "./utils/ApiError"
import { asyncHandler } from "./middlewares/asyncHandler.middleware"
import connectDb from "./db/database";
import passport from "passport";


const app = express()
const BASE_PATH = Env.BASE_PATH

// middlewares 

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize());
app.use(
    cors({
        origin: Env.FRONTEND_ORIGIN,
        credentials: true,
    })
);
app.get('/', asyncHandler( async (req: Request, res: Response, next: NextFunction) => {    
    throw new BadRequestException("This is a test error") 
    res
    .status(HttpStatus.OK)
    .json({ message: "Welcome to the server!" })
}))



// routes IMPORT

import authRouter from './routes/auth.route'
import loginRouter from './routes/auth.route'
import currentUserRouter from "./routes/user.route"
import createTransactionRouter from "./routes/transaction.route"
import getAllTransactionRouter from "./routes/transaction.route"

app.use(`${BASE_PATH}/auth`, authRouter)   // auth router
app.use(`${BASE_PATH}/login`, loginRouter)   // auth router
app.use(`${BASE_PATH}/user`, currentUserRouter)   // auth router
app.use(`${BASE_PATH}/transaction`, createTransactionRouter)   // auth router
app.use(`${BASE_PATH}/transaction`, getAllTransactionRouter)   // auth router



app.use(errorHandler)

app.listen(Env.PORT, async () => {
    await connectDb()
    console.log(`Server is running on port ${Env.PORT} in ${Env.NODE_ENV} mode.`)
})

export default app