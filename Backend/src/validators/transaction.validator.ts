import { z } from "zod"
import { PaymentMethodEnum, RecurringIntervalEnum, TransactionTypeEnum } from "../models/transaction.model"
import { Transaction } from "../models/transaction.model"
import { bulkDeleteTransaction } from "../controllers/transaction.controller"

const transactionIdSchema = z.string().trim().min(1)

const baseTransactionSchema = z.object({
    title: z.string().min(1, "Title is required!"),

    description: z.string().optional(),
    
    type: z.enum( [TransactionTypeEnum.INCOME, TransactionTypeEnum.EXPENSE],
    {
        errorMap: () => ({
            message: "Transaction type must be either INCOME or EXPENCE",
        })
    }),

    amount: z.number().positive("Amount must be positive").min(1),

    category: z.string().min(1, "Category is required"),

    date: z.union([
        z.string()
        .datetime({ message: "Invalid date string"}),
        z.date()
    ]).transform(val => new Date(val)),

    isRecurring: z.boolean().default(false),

    recurringInterval: z.enum([
        RecurringIntervalEnum.DAILY,
        RecurringIntervalEnum.MONTHLY,
        RecurringIntervalEnum.WEEKLY,
        RecurringIntervalEnum.YEARLY
    ]).nullable().optional(),

    receiptUrl: z.string().optional(),

    paymentMethod: z.enum([
        PaymentMethodEnum.AUTO_DEBIT,
        PaymentMethodEnum.BANK_TRANSFER,
        PaymentMethodEnum.CARD,
        PaymentMethodEnum.CASH,
        PaymentMethodEnum.MOBILE_PAYMENT,
        PaymentMethodEnum.OTHER
    ]).default(PaymentMethodEnum.CASH)

})

const bulkDeleteTransactionIdSchema = z.object({
    transactionIds: z.array(
                    z.string()
                    .length(24, "Invalid Transaction Id")
                    .min(1, "Atleast one transaction ID must be provided")
                )
})

const bulkTransactionSchema = z.object({
    transactions: z.array(baseTransactionSchema)
                    .min(1, "Atleast one transaction is required")
                    .max(300, "Must not be more than 300 transactions")
                    /*
                    What it's trying to do:
                    Iterate over each transaction
                    Convert it to a number
                    Check: positive (> 0) 
                           not too large (≤ 1 billion)
                    */
                    .refine((transactions) => transactions.every((transaction) => {
                        const amount = Number(transaction.amount)
                        return !NaN && amount > 0 && amount <= 1_000_000_000
                    }),
                    {
                        message: "Amount must be a positive number"
                    }
                )
})

// same validation for both.
const createTransactionSchema = baseTransactionSchema

const updateTransactionSchema = baseTransactionSchema

type createTransactionType = z.infer<typeof createTransactionSchema>

type updateTransactionType = z.infer<typeof updateTransactionSchema>

type bulkDeleteTransactionType = z.infer<typeof bulkDeleteTransactionIdSchema>


/*
z.infer<typeof createTransactionSchema>  automatically becomes:

{
  title: string
  type: "INCOME" | "EXPENSE"
  amount: number
  category: string
  date: Date
  isRecurring: boolean
  recurringInterval?: ...
  receiptUrl?: string
  paymentMethod: ...
}
*/

export {
    transactionIdSchema,

    createTransactionSchema,
    createTransactionType,

    updateTransactionSchema,
    updateTransactionType,

    bulkDeleteTransactionIdSchema,
    bulkDeleteTransactionType,

    bulkDeleteTransaction,
    bulkTransactionSchema
}