import { IsOptional, IsDateString } from 'class-validator';

export class GetPaymentStatisticsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
