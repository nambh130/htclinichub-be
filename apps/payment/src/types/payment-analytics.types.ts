export interface PaymentSummary {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  cancelledPayments: number;
  totalAmount: number;
  successfulAmount: number;
  failedAmount: number;
  cancelledAmount: number;
  successRate: number;
  averageTransactionValue: number;
}

export interface PaymentComparison {
  previousPeriod: string;
  previousStartDate: Date;
  previousEndDate: Date;
  previousSummary: PaymentSummary;
  changes: {
    totalPaymentsChange: number;
    successfulPaymentsChange: number;
    totalAmountChange: number;
    successRateChange: number;
    averageTransactionValueChange: number;
  };
  percentages: {
    totalPaymentsPercentage: number;
    successfulPaymentsPercentage: number;
    totalAmountPercentage: number;
    successRatePercentage: number;
    averageTransactionValuePercentage: number;
  };
}

export interface PaymentBreakdown {
  byStatus: Array<{ status: string; count: number; amount: number }>;
  byMethod: Array<{ method: string; count: number; amount: number }>;
  byDay?: Array<{ date: string; count: number; amount: number }>;
  byWeek?: Array<{ week: string; count: number; amount: number }>;
  byMonth?: Array<{ month: string; count: number; amount: number }>;
}

export interface PaymentAnalytics {
  period: string;
  startDate: Date;
  endDate: Date;
  summary: PaymentSummary;
  comparison?: PaymentComparison;
  breakdown: PaymentBreakdown;
}
