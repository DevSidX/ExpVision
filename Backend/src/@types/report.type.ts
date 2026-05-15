
type ReportType = {
    period: string
    totalIncome: number
    totalExpense: number
    availableBalance: number   
    savingsRate: number
    topSpendingCategories: Array<{ name: string, percentage: number }>
    insights: string[]
};

export { ReportType }