import { Router } from "express";
import { bulkDeleteTransaction, createTransaction, deleteTransaction, duplicateTransaction, getAllTransactions, getTransactionById, updateTransaction } from "../controllers/transaction.controller";
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

router.route("/delete/:id").delete(
    passportAuthenticateJwt,
    deleteTransaction
)

router.route("/bulk-delete").delete(
    passportAuthenticateJwt,
    bulkDeleteTransaction
)

export default router