import { Router } from "express";
import { createTransaction, duplicateTransaction, getAllTransactions, getTransactionById, updateTransaction } from "../controllers/transaction.controller";
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

router.route("/update/:id").put(
    passportAuthenticateJwt,
    updateTransaction
)

export default router