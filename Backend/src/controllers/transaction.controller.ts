import { HttpStatus } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { Request, Response } from "express";
import { createTransactionSchema, transactionIdSchema, updateTransactionSchema } from "../validators/transaction.validator";
import { createTransactionService, duplicateTransactionService, getAllTransactionsService, getTransactionsByIdService, updateTransactionService } from "../services/transaction.service";
import { TransactionTypeEnum } from "../models/transaction.model";

const createTransaction = asyncHandler( async (req: Request, res: Response) => {
    const body = createTransactionSchema.parse(req.body)

    const userId = req.user?._id

    const transaction = await createTransactionService(body, userId)

    return res
    .status(HttpStatus.CREATED)
    .json(
        {
            transaction,
            message: "Transaction created successfully!"
        }
    )
})

const getAllTransactions = asyncHandler( async (req: Request, res: Response) => {
    const userId = req.user?._id

    const filters = {
        keyword: req.query.keyword as string | undefined,
        type: req.query.type as keyof typeof TransactionTypeEnum | undefined,
        recurringStatus: req.query.recurringStatus as "RECURRING" | "NON_RECURRING" | undefined
    }

    const pagination = {
        pageSize: parseInt(req.query.pageSize as string) || 20,
        pageNumber: parseInt(req.query.pageNumber as string) || 1
    }

    const result = await getAllTransactionsService(userId, filters, pagination)

    return res
    .status(HttpStatus.OK)
    .json(
        {
            message: "All Transactions fetched successfully!",
            result
        }
    )
})

const getTransactionById = asyncHandler( async (req: Request, res: Response) => {
    const userId = req.user?._id

    const transactionId = transactionIdSchema.parse(req.params?.id)

    const transaction = await getTransactionsByIdService(userId, transactionId)

    return res
    .status(HttpStatus.OK)
    .json(
        {
            message: "All user transaction fetched successfully!",
            transaction
        }
    )
})

const duplicateTransaction = asyncHandler( async (req: Request, res: Response) => {
    const userId = req.user?._id

    const transactionId = transactionIdSchema.parse(req.params?.id)

    const duplicateTransaction = await duplicateTransactionService(userId, transactionId)

    return res
    .status(HttpStatus.OK)
    .json(
        {
            message: "Transaction duplicated successfully!",
            duplicateTransaction
        }
    )
})

const updateTransaction = asyncHandler( async (req: Request, res: Response) => {
    const userId = req.user?._id

    const transactionId = transactionIdSchema.parse(req.params.id)

    const body = updateTransactionSchema.parse(req.body)

    await updateTransactionService(userId, transactionId, body)

    return res
    .status(HttpStatus.OK)
    .json(   
        {
            message: "Transaction updated successfully!",
        }
    )
})

export {
    createTransaction,
    getAllTransactions,
    getTransactionById,
    duplicateTransaction,
    updateTransaction
}