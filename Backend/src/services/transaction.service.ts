import { Transaction, TransactionTypeEnum } from "../models/transaction.model";
import { NotFoundException } from "../utils/ApiError";
import { calculateNextOccurance } from "../utils/calculateNextReportDate";
import { bulkDeleteTransactionType, createTransactionType, updateTransactionType } from "../validators/transaction.validator";


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
    pagination: { 
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

const getTransactionsByIdService = async (userId: string, transactionId: string) => {
    const transaction = await Transaction.findOne({
        _id: transactionId,
        userId: userId
    })

    if (!transaction) {
        throw new NotFoundException("Transaction not Found!");
    }

    return transaction
}

const duplicateTransactionService = async (userId: string, transactionId: string) => {
    const transaction = await Transaction.findOne({
        _id: transactionId,
        userId: userId
    })

    if (!transaction) {
        throw new NotFoundException("Transaction not Found!");
    }

    const duplicated = Transaction.create({
        ...transaction.toObject(), // convert it into object
        _id: undefined,
        title: `Duplicate - ${transaction.title}`,
        description: transaction.description ? `${transaction.description} (Duplicate)` : "Duplicated transaction",
        isRecurring: false,
        recurringInterval: undefined,
        nextRecurringDate: undefined,
        createdAt: undefined,
        updatedAt: undefined
    })

    return duplicated
}

const updateTransactionService = async (userId: string, transactionId: string, body: updateTransactionType) => {
    const transaction = await Transaction.findOne({
        _id: transactionId,
        userId: userId,
    })

    if (!transaction) {
        throw new NotFoundException("Transaction not found!");
    }

    const now = new Date()
    
    const isRecurring = body.isRecurring ?? transaction.isRecurring // ?? returns the right side ONLY if the left side is null or undefined

    const date = body.date === undefined ? new Date(body.date) : transaction.date

    const recurringInterval = body.recurringInterval || transaction.recurringInterval

    let nextRecurringDate: Date | undefined

    if(isRecurring && recurringInterval){
        const calculatedDate = calculateNextOccurance(date, recurringInterval)

        if(calculatedDate && calculatedDate < now){ // because calculatedDate can be Date | undefined
            nextRecurringDate = calculateNextOccurance(now, recurringInterval)
        } else {
            nextRecurringDate = calculatedDate
        }
    }

    transaction.set({
        ...(body.title && 
            { 
                title:  body.title 
            }
        ),
        ...(body.description && 
            { 
                description:  body.description 
            }
        ),
        ...(body.category && 
            { 
                category:  body.category 
            }
        ),
        ...(body.type && 
            { 
                type:  body.type 
            }
        ),
        ...(body.paymentMethod && 
            { 
                paymentMethod:  body.paymentMethod 
            }
        ),
        ...(body.amount !== undefined && 
            { 
                amount:  body.amount 
            }
        ),
        date,
        isRecurring,
        recurringInterval,
        nextRecurringDate
    })

    await transaction.save()

    return;
}

const deleteTransactionService = async (userId: string, transactionId: string) => {
    const deletedTransaction = await Transaction.findOneAndDelete({
        _id: transactionId,
        userId: userId,
    })

    if (!deletedTransaction) {
        throw new NotFoundException("Transaction not Found!");
    }

    return deletedTransaction
}

const bulkDeleteTransactionService = async (userId: string, transactionIds: string[]) => {
    const deletedTransaction = await Transaction.deleteMany({
        _id: {
            $in: transactionIds
        },
        userId: userId,
    })

    if (deletedTransaction.deletedCount === 0) {
        throw new NotFoundException("Transaction not Found!");
    }

    return {
        success: true,
        deleteCount: deletedTransaction.deletedCount
    }
}

const bulkTransactionService = async (userId: string, transactions: createTransactionType[]) => {
    try {
        const bulkOperations = transactions.map((transaction) => ({
            insertOne: {
                document: {
                    ...transaction,
                    userId,
                    isRecurring: false,
                    nextRecurringDate: null,
                    recurringInterval: null,
                    lastProcesses: null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            }
        }))

        const result = await Transaction.bulkWrite(bulkOperations, { ordered: true })

        return {
            insertedCount: result.insertedCount,
            success: true
        }

    } catch (error) {
        throw error
    }
}

export {
    createTransactionService,
    getAllTransactionsService,
    getTransactionsByIdService,
    duplicateTransactionService,
    updateTransactionService,
    deleteTransactionService,
    bulkDeleteTransactionService,
    bulkTransactionService
}