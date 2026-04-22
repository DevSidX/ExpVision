import mongoose, { Document } from "mongoose";
import { convertPaiseToRupee, convertRupeeToPaise } from "../utils/formatCurrency";

export enum TransactionStatusEnum {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}

export enum RecurringIntervalEnum {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY"
}

export enum TransactionTypeEnum {
    INCOME = "INCOME",
    EXPENSE = "EXPENSE"
}

export enum PaymentMethodEnum {
    CASH = "CASH",
    CARD = "CARD",
    BANK_TRANSFER = "BANK_TRANSFER",
    MOBILE_PAYMENT = "MOBILE_PAYMENT",
    AUTO_DEBIT = "AUTO_DEBIT",
    OTHER = "OTHER",
}

export interface transactionDocument extends Document {
    userId: mongoose.Types.ObjectId,
    type: keyof typeof TransactionTypeEnum,
    title: string,
    amount: number,
    category: string,
    receiptUrl?: string,
    recurringInterval?: keyof typeof RecurringIntervalEnum,
    nextRecurringDate?: Date,
    lastProcessedDate?: Date,
    isRecurring: boolean,
    description?: string,
    date: Date,
    status: keyof typeof TransactionStatusEnum,
    paymentMethod?: keyof typeof PaymentMethodEnum,
    createAt: Date,
    updatedAt: Date
}

const transactionSchema = new mongoose.Schema<transactionDocument>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            enum: Object.keys(TransactionTypeEnum),
            required: true
        },
        amount: {
            type: Number,
            required: true,
            set: (value: number) => convertRupeeToPaise(value),  // convert rupee to paise when saving to database 
            get: (value: number) => convertPaiseToRupee(value)   // convert paise to rupee when sending response to client
        },
        description: {
            type: String,
        },
        category: {
            type: String,
            required: true      
        },
        receiptUrl: {
            type: String,
        },
        date: {
            type: Date,
            default: Date.now
        },
        isRecurring: {
            type: Boolean,
            default: false
        },
        recurringInterval: {
            type: String,
            enum: Object.values(RecurringIntervalEnum),
            default: null
        },
        nextRecurringDate: {
            type: Date,
        },
        lastProcessedDate: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            enum: Object.values(TransactionStatusEnum),
            default: TransactionStatusEnum.COMPLETED
        },
        paymentMethod: {
            type: String,
            enum: Object.values(PaymentMethodEnum),
            default: PaymentMethodEnum.CASH
        }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            getters: true
        },
        toObject: {
            virtuals: true,
            getters: true
        }
    }
)

export const Transaction = mongoose.model<transactionDocument>("Transaction", transactionSchema)