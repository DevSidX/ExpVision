
type ReportType = {
    period: string
    totalIncome: number
    totalExpence: number
    availableBalance: number   
    savingsRate: number
    topSpendingCategories: Array<{ name: string, percentage: number }>
    insights: string[]
};

export { ReportType }