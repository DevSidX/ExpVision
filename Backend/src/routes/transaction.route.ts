import { Router } from "express";
import { bulkDeleteTransaction, bulkTransaction, createTransaction, deleteTransaction, duplicateTransaction, getAllTransactions, getTransactionById, updateTransaction } from "../controllers/transaction.controller";
import { passportAuthenticateJwt } from "../config/passport.config";

const router = Router()

router.use(passportAuthenticateJwt)

router.route("/create").post(
    createTransaction
)

router.route("/all").get(
    getAllTransactions
)

router.route("/:id").get(
    getTransactionById
)

router.route("/duplicate/:id").put(
    duplicateTransaction
)

router.route("/update/:id").put(
    updateTransaction
)

router.route("/delete/:id").delete(
    deleteTransaction
)

router.route("/bulk-delete").delete(
    bulkDeleteTransaction
)

router.route("/bulk-transaction").post(
    bulkTransaction
)

export default router