import { Router } from "express";
import { createTransaction, duplicateTransaction, getAllTransactions, getTransactionById } from "../controllers/transaction.controller";
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

router.route("/:id").get(
    passportAuthenticateJwt,
    getTransactionById
)

router.route("/duplicate/:id").put(
    passportAuthenticateJwt,
    duplicateTransaction
)

export default router