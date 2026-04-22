import { addDays, addMonths, addWeeks, addYears, startOfMonth } from 'date-fns'
import { RecurringIntervalEnum } from '../models/transaction.model'

// It calculates future dates for: reports (monthly) and recurring transactions (daily/weekly/monthly/yearly)
// Always returns: 1st day of next month at 00:00
function calculateNextReportDate (lastSentDate?: Date): Date {
    const now = new Date()
    const lastSent = lastSentDate || now

    const nextDate = startOfMonth(addMonths(lastSent, 1))
    nextDate.setHours(0,0,0,0)

    return nextDate
}

//  Used for recurring transactions means transaction that repeats automatically after some time
// auto-repeat after fixed time (daily/weekly/monthly/yearly)

function calculateNextOccurance(date: Date, recurringInterval:keyof typeof RecurringIntervalEnum) {
    const base = new Date(date)
    base.setHours(0,0,0,0)

    switch (recurringInterval) {
        case RecurringIntervalEnum.DAILY:
            return addDays(base, 1)

        case RecurringIntervalEnum.MONTHLY:
            return addMonths(base, 1)

        case RecurringIntervalEnum.WEEKLY:
            return addWeeks(base, 1)

        case RecurringIntervalEnum.YEARLY:
            return addYears(base, 1)

        default:
            base;
    }
}

export {
    calculateNextReportDate,
    calculateNextOccurance
}