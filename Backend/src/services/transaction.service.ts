import { Transaction, TransactionTypeEnum } from "../models/transaction.model";
import { calculateNextOccurance } from "../utils/calculateNextReportDate";
import { createTransactionType } from "../validators/transaction.validator";


const createTransactionService = async (body: createTransactionType, userId: string) => {
    let nextRecurringDate: Date | undefined
    const currentDate = new Date();

    // Run this block only if the transaction should repeat AND we know how it repeats
    if(body.isRecurring && body.recurringInterval){
        const calculatedDate = calculateNextOccurance(body.date, body.recurringInterval)

        if(calculatedDate && calculatedDate < currentDate){ // because calculatedDate can be Date | undefined
            nextRecurringDate = calculateNextOccurance(currentDate, body.recurringInterval)
        } else {
            nextRecurringDate = calculatedDate
        }
    }

    const transaction = await Transaction.create({
        ...body,
        userId,
        category: body.category,
        amount: Number(body.amount),
        isRecurring: body.isRecurring || false,
        recurringInterval: body.recurringInterval || null,
        nextRecurringDate,
        lastProcessedDate: null,
    })

    return transaction
}

const getAllTransactionsService = async (
    userId: string, 
    filters: {
        keyword?: string,
        type?: keyof typeof TransactionTypeEnum,
        recurringStatus?: "RECURRING" | "NON_RECURRING"
    },
    pagination: { // ?
        pageSize: number,
        pageNumber: number
    }
    ) => {
        const { keyword, type, recurringStatus } = filters

        const filterConditions: Record<string, any> = { userId }   // A variable that will hold a MongoDB query object.

        if (keyword) {
            filterConditions.$or = [
                {
                    title: {
                        $regex: keyword,
                        $options: "i"
                    }
                },
                {
                    category: {
                        $regex: keyword,
                        $options: "i"
                    },
                }
            ]
        }

        if(type){
            filterConditions.type = type
        }
        
        if(recurringStatus === "RECURRING"){
            filterConditions.isRecurring = true
        }
        else if (recurringStatus === "NON_RECURRING") {
            filterConditions.isRecurring = false
        }

        const { pageSize, pageNumber } = pagination

        const skip = (pageNumber - 1) * pageSize

        const [ transactions, totalCount ] = await Promise.all(
            [
                Transaction.find(filterConditions) // all filtered transactions
                .skip(skip)
                .limit(pageSize)
                .sort({ createdAt: -1 }),
                Transaction.countDocuments(filterConditions)  // totalCount of filtered transactions
            ]
        )

        const totalPages = Math.ceil(totalCount / pageSize); // like 10 pages for 100 transactions

    return {
        transactions,
        pagination: {
            pageSize,
            pageNumber,
            totalCount,
            totalPages,
            skip
        }
    }

}

export {
    createTransactionService,
    getAllTransactionsService
}