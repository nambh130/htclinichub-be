import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { PaymentStatus, PaymentMethod } from './enums/payment-status.enum';
import { AnalyticsPeriod } from './dtos/payment-analytics.dto';
import {
  PaymentAnalytics,
  PaymentSummary,
  PaymentBreakdown,
} from './types/payment-analytics.types';

@Injectable()
export class PaymentAnalyticsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentTransaction)
    private readonly transactionRepository: Repository<PaymentTransaction>,
  ) {}

  /**
   * Get payment analytics for a specific period
   */
  async getPaymentAnalytics(
    clinicId: string,
    period: AnalyticsPeriod,
    customStartDate?: Date,
    customEndDate?: Date,
  ): Promise<PaymentAnalytics> {
    const { startDate, endDate, previousStartDate, previousEndDate } =
      this.getDateRange(period, customStartDate, customEndDate);

    // Get current period analytics
    const currentAnalytics = await this.getAnalyticsForPeriod(
      clinicId,
      startDate,
      endDate,
    );

    // Get comparison period analytics
    let comparisonAnalytics = null;
    if (previousStartDate && previousEndDate) {
      comparisonAnalytics = await this.getAnalyticsForPeriod(
        clinicId,
        previousStartDate,
        previousEndDate,
      );
    }

    // Calculate changes and percentages
    const changes = comparisonAnalytics
      ? this.calculateChanges(
          currentAnalytics,
          comparisonAnalytics as PaymentSummary,
        )
      : null;
    const percentages = comparisonAnalytics
      ? this.calculatePercentages(
          currentAnalytics,
          comparisonAnalytics as PaymentSummary,
        )
      : null;

    // Get breakdown data
    const breakdown = await this.getBreakdownData(
      clinicId,
      startDate,
      endDate,
      period,
    );

    return {
      period: this.getPeriodLabel(period),
      startDate,
      endDate,
      summary: currentAnalytics,
      comparison: comparisonAnalytics
        ? {
            previousPeriod: this.getPreviousPeriodLabel(period),
            previousStartDate: previousStartDate,
            previousEndDate: previousEndDate,
            previousSummary: comparisonAnalytics as PaymentSummary,
            changes: changes,
            percentages: percentages,
          }
        : undefined,
      breakdown,
    } as PaymentAnalytics;
  }

  /**
   * Get analytics for a specific date range
   */
  private async getAnalyticsForPeriod(
    clinicId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<PaymentSummary> {
    const payments = await this.paymentRepository.find({
      where: {
        clinicId,
        createdAt: Between(startDate, endDate),
      },
    });

    const totalPayments = payments.length;
    const successfulPayments = payments.filter(
      (p) => p.status === PaymentStatus.PAID,
    ).length;
    const failedPayments = payments.filter(
      (p) => p.status === PaymentStatus.FAILED,
    ).length;
    const cancelledPayments = payments.filter(
      (p) => p.status === PaymentStatus.CANCELLED,
    ).length;

    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const successfulAmount = payments
      .filter((p) => p.status === PaymentStatus.PAID)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const failedAmount = payments
      .filter((p) => p.status === PaymentStatus.FAILED)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const cancelledAmount = payments
      .filter((p) => p.status === PaymentStatus.CANCELLED)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const successRate =
      totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;
    const averageTransactionValue =
      successfulPayments > 0 ? successfulAmount / successfulPayments : 0;

    return {
      totalPayments,
      successfulPayments,
      failedPayments,
      cancelledPayments,
      totalAmount,
      successfulAmount,
      failedAmount,
      cancelledAmount,
      successRate: Math.round(successRate * 100) / 100,
      averageTransactionValue: Math.round(averageTransactionValue * 100) / 100,
    };
  }

  /**
   * Get breakdown data for the period
   */
  private async getBreakdownData(
    clinicId: string,
    startDate: Date,
    endDate: Date,
    period: AnalyticsPeriod,
  ): Promise<PaymentBreakdown> {
    const payments = await this.paymentRepository.find({
      where: {
        clinicId,
        createdAt: Between(startDate, endDate),
      },
    });

    // Breakdown by status
    const byStatus: Array<{ status: string; count: number; amount: number }> = [
      {
        status: 'PAID',
        count: payments.filter((p) => p.status === PaymentStatus.PAID).length,
        amount: payments
          .filter((p) => p.status === PaymentStatus.PAID)
          .reduce((sum, p) => sum + Number(p.amount), 0),
      },
      {
        status: 'PENDING',
        count: payments.filter((p) => p.status === PaymentStatus.PENDING)
          .length,
        amount: payments
          .filter((p) => p.status === PaymentStatus.PENDING)
          .reduce((sum, p) => sum + Number(p.amount), 0),
      },
      {
        status: 'FAILED',
        count: payments.filter((p) => p.status === PaymentStatus.FAILED).length,
        amount: payments
          .filter((p) => p.status === PaymentStatus.FAILED)
          .reduce((sum, p) => sum + Number(p.amount), 0),
      },
      {
        status: 'CANCELLED',
        count: payments.filter((p) => p.status === PaymentStatus.CANCELLED)
          .length,
        amount: payments
          .filter((p) => p.status === PaymentStatus.CANCELLED)
          .reduce((sum, p) => sum + Number(p.amount), 0),
      },
    ];

    // Breakdown by payment method
    const byMethod: Array<{ method: string; count: number; amount: number }> = [
      {
        method: 'BANKING',
        count: payments.filter((p) => p.paymentMethod === PaymentMethod.BANKING)
          .length,
        amount: payments
          .filter((p) => p.paymentMethod === PaymentMethod.BANKING)
          .reduce((sum, p) => sum + Number(p.amount), 0),
      },
      {
        method: 'CASH',
        count: payments.filter((p) => p.paymentMethod === PaymentMethod.CASH)
          .length,
        amount: payments
          .filter((p) => p.paymentMethod === PaymentMethod.CASH)
          .reduce((sum, p) => sum + Number(p.amount), 0),
      },
    ];

    let byDay:
      | Array<{ date: string; count: number; amount: number }>
      | undefined;
    let byWeek:
      | Array<{ week: string; count: number; amount: number }>
      | undefined;
    let byMonth:
      | Array<{ month: string; count: number; amount: number }>
      | undefined;

    // Add time-based breakdowns based on period
    if (
      period === AnalyticsPeriod.TODAY ||
      period === AnalyticsPeriod.YESTERDAY ||
      period === AnalyticsPeriod.WEEK ||
      period === AnalyticsPeriod.LAST_WEEK
    ) {
      byDay = await this.getDailyBreakdown(clinicId, startDate, endDate);
    }

    if (
      period === AnalyticsPeriod.MONTH ||
      period === AnalyticsPeriod.LAST_MONTH
    ) {
      byWeek = await this.getWeeklyBreakdown(clinicId, startDate, endDate);
    }

    if (
      period === AnalyticsPeriod.YEAR ||
      period === AnalyticsPeriod.LAST_YEAR
    ) {
      byMonth = await this.getMonthlyBreakdown(clinicId, startDate, endDate);
    }

    return {
      byStatus,
      byMethod,
      byDay,
      byWeek,
      byMonth,
    } as PaymentBreakdown;
  }

  /**
   * Get daily breakdown
   */
  private async getDailyBreakdown(
    clinicId: string,
    startDate: Date,
    endDate: Date,
  ) {
    interface RawDailyResult {
      date: string;
      count: string;
      amount: string;
    }

    const payments = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('DATE(payment.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(payment.amount)', 'amount')
      .where('payment.clinicId = :clinicId', { clinicId })
      .andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('DATE(payment.createdAt)')
      .orderBy('DATE(payment.createdAt)', 'ASC')
      .getRawMany<RawDailyResult>();

    return payments.map((p) => ({
      date: p.date,
      count: parseInt(p.count),
      amount: Math.round(Number(p.amount) * 100) / 100,
    }));
  }

  /**
   * Get weekly breakdown
   */
  private async getWeeklyBreakdown(
    clinicId: string,
    startDate: Date,
    endDate: Date,
  ) {
    interface RawWeeklyResult {
      week: string;
      count: string;
      amount: string;
    }

    const payments = await this.paymentRepository
      .createQueryBuilder('payment')
      .select("DATE_TRUNC('week', payment.createdAt)", 'week')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(payment.amount)', 'amount')
      .where('payment.clinicId = :clinicId', { clinicId })
      .andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy("DATE_TRUNC('week', payment.createdAt)")
      .orderBy("DATE_TRUNC('week', payment.createdAt)", 'ASC')
      .getRawMany<RawWeeklyResult>();

    return payments.map((p) => ({
      week: p.week,
      count: parseInt(p.count),
      amount: Math.round(Number(p.amount) * 100) / 100,
    }));
  }

  /**
   * Get monthly breakdown
   */
  private async getMonthlyBreakdown(
    clinicId: string,
    startDate: Date,
    endDate: Date,
  ) {
    interface RawMonthlyResult {
      month: string;
      count: string;
      amount: string;
    }

    const payments = await this.paymentRepository
      .createQueryBuilder('payment')
      .select("DATE_TRUNC('month', payment.createdAt)", 'month')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(payment.amount)', 'amount')
      .where('payment.clinicId = :clinicId', { clinicId })
      .andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy("DATE_TRUNC('month', payment.createdAt)")
      .orderBy("DATE_TRUNC('month', payment.createdAt)", 'ASC')
      .getRawMany<RawMonthlyResult>();

    return payments.map((p) => ({
      month: p.month,
      count: parseInt(p.count),
      amount: Math.round(Number(p.amount) * 100) / 100,
    }));
  }

  /**
   * Calculate date ranges based on period
   */
  private getDateRange(
    period: AnalyticsPeriod,
    customStartDate?: Date,
    customEndDate?: Date,
  ) {
    const now = new Date();
    let startDate: Date,
      endDate: Date,
      previousStartDate: Date | null = null,
      previousEndDate: Date | null = null;

    let weekStart: Date;
    let lastWeekStart: Date;

    switch (period) {
      case AnalyticsPeriod.TODAY:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999,
        );
        previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        previousEndDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
        break;

      case AnalyticsPeriod.YESTERDAY:
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 1,
        );
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 1,
          23,
          59,
          59,
          999,
        );
        previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        previousEndDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
        break;

      case AnalyticsPeriod.WEEK:
        weekStart = new Date(
          now.getTime() - now.getDay() * 24 * 60 * 60 * 1000,
        );
        startDate = new Date(
          weekStart.getFullYear(),
          weekStart.getMonth(),
          weekStart.getDate(),
        );
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999,
        );
        previousStartDate = new Date(
          startDate.getTime() - 7 * 24 * 60 * 60 * 1000,
        );
        previousEndDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        break;

      case AnalyticsPeriod.LAST_WEEK:
        lastWeekStart = new Date(
          now.getTime() - (now.getDay() + 7) * 24 * 60 * 60 * 1000,
        );
        startDate = new Date(
          lastWeekStart.getFullYear(),
          lastWeekStart.getMonth(),
          lastWeekStart.getDate(),
        );
        endDate = new Date(
          lastWeekStart.getTime() +
            6 * 24 * 60 * 60 * 1000 -
            24 * 60 * 60 * 1000,
          23,
          59,
          59,
          999,
        );
        previousStartDate = new Date(
          startDate.getTime() - 7 * 24 * 60 * 60 * 1000,
        );
        previousEndDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        break;

      case AnalyticsPeriod.MONTH:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999,
        );
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEndDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
          23,
          59,
          59,
          999,
        );
        break;

      case AnalyticsPeriod.LAST_MONTH:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
          23,
          59,
          59,
          999,
        );
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        previousEndDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
          23,
          59,
          59,
          999,
        );
        break;

      case AnalyticsPeriod.YEAR:
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999,
        );
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        previousEndDate = new Date(
          now.getFullYear() - 1,
          11,
          31,
          23,
          59,
          59,
          999,
        );
        break;

      case AnalyticsPeriod.LAST_YEAR:
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        previousStartDate = new Date(now.getFullYear() - 2, 0, 1);
        previousEndDate = new Date(
          now.getFullYear() - 2,
          11,
          31,
          23,
          59,
          59,
          999,
        );
        break;

      case AnalyticsPeriod.CUSTOM:
        if (!customStartDate || !customEndDate) {
          throw new Error(
            'Custom start and end dates are required for custom period',
          );
        }
        startDate = customStartDate;
        endDate = customEndDate;
        // For custom periods, we don't provide comparison data
        break;

      default:
        throw new Error(`Invalid period: ${period as string}`);
    }

    return { startDate, endDate, previousStartDate, previousEndDate };
  }

  /**
   * Calculate changes between two periods
   */
  private calculateChanges(current: PaymentSummary, previous: PaymentSummary) {
    return {
      totalPaymentsChange: current.totalPayments - previous.totalPayments,
      successfulPaymentsChange:
        current.successfulPayments - previous.successfulPayments,
      totalAmountChange: current.totalAmount - previous.totalAmount,
      successRateChange: current.successRate - previous.successRate,
      averageTransactionValueChange:
        current.averageTransactionValue - previous.averageTransactionValue,
    };
  }

  /**
   * Calculate percentage changes between two periods
   */
  private calculatePercentages(
    current: PaymentSummary,
    previous: PaymentSummary,
  ) {
    return {
      totalPaymentsPercentage:
        previous.totalPayments > 0
          ? ((current.totalPayments - previous.totalPayments) /
              previous.totalPayments) *
            100
          : 0,
      successfulPaymentsPercentage:
        previous.successfulPayments > 0
          ? ((current.successfulPayments - previous.successfulPayments) /
              previous.successfulPayments) *
            100
          : 0,
      totalAmountPercentage:
        previous.totalAmount > 0
          ? ((current.totalAmount - previous.totalAmount) /
              previous.totalAmount) *
            100
          : 0,
      successRatePercentage:
        previous.successRate > 0
          ? ((current.successRate - previous.successRate) /
              previous.successRate) *
            100
          : 0,
      averageTransactionValuePercentage:
        previous.averageTransactionValue > 0
          ? ((current.averageTransactionValue -
              previous.averageTransactionValue) /
              previous.averageTransactionValue) *
            100
          : 0,
    };
  }

  /**
   * Get period label
   */
  private getPeriodLabel(period: AnalyticsPeriod): string {
    const labels: Record<AnalyticsPeriod, string> = {
      [AnalyticsPeriod.TODAY]: 'Hôm nay',
      [AnalyticsPeriod.YESTERDAY]: 'Hôm qua',
      [AnalyticsPeriod.WEEK]: 'Tuần này',
      [AnalyticsPeriod.LAST_WEEK]: 'Tuần trước',
      [AnalyticsPeriod.MONTH]: 'Tháng này',
      [AnalyticsPeriod.LAST_MONTH]: 'Tháng trước',
      [AnalyticsPeriod.YEAR]: 'Năm nay',
      [AnalyticsPeriod.LAST_YEAR]: 'Năm trước',
      [AnalyticsPeriod.CUSTOM]: 'Tùy chỉnh',
    };
    return labels[period];
  }

  /**
   * Get previous period label
   */
  private getPreviousPeriodLabel(period: AnalyticsPeriod): string {
    const labels: Record<AnalyticsPeriod, string> = {
      [AnalyticsPeriod.TODAY]: 'Hôm qua',
      [AnalyticsPeriod.YESTERDAY]: 'Hôm kia',
      [AnalyticsPeriod.WEEK]: 'Tuần trước',
      [AnalyticsPeriod.LAST_WEEK]: 'Tuần trước đó',
      [AnalyticsPeriod.MONTH]: 'Tháng trước',
      [AnalyticsPeriod.LAST_MONTH]: 'Tháng trước đó',
      [AnalyticsPeriod.YEAR]: 'Năm trước',
      [AnalyticsPeriod.LAST_YEAR]: 'Năm trước đó',
      [AnalyticsPeriod.CUSTOM]: 'Không có',
    };
    return labels[period];
  }
}
