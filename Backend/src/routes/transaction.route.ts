import { Router } from "express";
import { createTransaction, getAllTransactions } from "../controllers/transaction.controller";
import { passportAuthenticateJwt } from "../config/passport.config";

const router = Router()

router.route("/create").post(
    passportAuthenticateJwt,
    createTransaction
)

router.route("/all").get(
    passportAuthenticateJwt,
    getAllTransactions
)

export default router