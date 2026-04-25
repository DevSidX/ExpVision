// Create a stream (cursor) of all recurring transactions whose scheduled time has arrived, so we can process them efficiently one by one without loading everything into memory

import mongoose from "mongoose";
import { Transaction } from "../../models/transaction.model"
import { calculateNextOccurance } from "../../utils/calculateNextReportDate";

const processRecurringTransaction = async () => {
    // find all the transactions whose due dates has arrived
    // process them one by one
    // create a normal transaction entry from them
    // move the recurring transactions next execution date forward
    // do everything safely inside a mongoDB transaction

    const now = new Date()
    let processedCount = 0
    let failedCount = 0

    try {
        // Give me all recurring transactions whose next execution time has arrived (or passed)
        const transactionCursor = Transaction.find({
            isRecurring: true,
            nextRecurringDate: { $lte: now }, // 
        }).cursor() // this means mongoDb sends documents one by one

        console.log("Staring recurring process");

        // This loops through the cursor asynchronously.
        for await(const transaction of transactionCursor){
            const nextDate = calculateNextOccurance(transaction.nextRecurringDate!, transaction.recurringInterval!)

            const session = await mongoose.startSession()
            try {
                await session.withTransaction( async () => {
                    
                    await Transaction.create([
                        {
                            ...transaction.toObject(),
                            _id: new mongoose.Types.ObjectId(),
                            title: `Recurring - ${transaction.title}`,
                            date: transaction.nextRecurringDate,
                            isRecurring: false,
                            nextRecurringDate: null,
                            recurringInterval: undefined,
                            lastProcessedDate: undefined
                        },
                    ],
                    { session }
                    )

                    await Transaction.updateOne( // update the next time that this transaction will execute
                        { _id: transaction._id },
                        {
                            $set: {
                                nextRecurringDate: nextDate,
                                lastProcessedDate: now
                            }
                        },
                        { session }
                    )
                },
                {  // at most 20 seconds to commit the transaction.
                    maxCommitTimeMS: 20000
                }
                )
            processedCount++;
            } catch (error: any) {
                failedCount++
                console.log(`Failed recurring transaction ${transaction._id} `, error);
                
            } finally {
                await session.endSession();
            }
        }
        console.log(`✅ Processed: ${processedCount} transactions`);
        console.log(`❌ Failed: ${failedCount} transactions`);
        
        return {
            success: true,
            processedCount,
            failedCount
        }
    } catch (error: any) {
        console.error("Error occur processing transaction", error);

        return {
            success: false,
            error: error?.message
        }
    }
}

export {
    processRecurringTransaction
}