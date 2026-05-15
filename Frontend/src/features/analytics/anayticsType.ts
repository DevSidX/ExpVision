export interface FilterParams {
  preset?: string;
  from?: string;
  to?: string;
}

interface PercentageChange {
  income: number;
  expence: number;
  balance: number;
  prevPeriodFrom: string | null;
  prevPeriodTo: string | null;
}

interface PresetType {
  from: string;
  to: string;
  value: string;
  label: string;
}

export interface SummaryAnalyticsResponse {
  message: string;
  data: {
    availableBalance: number;
    totalIncome: number;
    totalExpence: number;
    transactionCount: number;
    savingRate: {
      percentage: number;
      expenseRatio: number;
    };
    percentageChange: PercentageChange;
    preset: PresetType;
  };
}

export interface ChartAnalyticsResponse {
  message: string;
  data: {
    chartData: {
      date: string;
      income: number;
      expence: number;
    }[];
    totalIncomeCount: number;
    totalExpenceCount: number;
    preset: PresetType;
  };
}

export interface ExpensePieChartBreakdownResponse {
  message: string;
  data: {
    totalSpent: number;
    breakdown: {
      name: string;
      value: number;
      percentage: number;
    }[];
    preset: PresetType;
  };
}
