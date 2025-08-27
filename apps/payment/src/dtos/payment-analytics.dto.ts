import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export enum AnalyticsPeriod {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  WEEK = 'week',
  LAST_WEEK = 'lastWeek',
  MONTH = 'month',
  LAST_MONTH = 'lastMonth',
  YEAR = 'year',
  LAST_YEAR = 'lastYear',
  CUSTOM = 'custom',
}

export class GetPaymentAnalyticsDto {
  @IsEnum(AnalyticsPeriod)
  period: AnalyticsPeriod;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  customStartDate?: Date;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  customEndDate?: Date;
}
