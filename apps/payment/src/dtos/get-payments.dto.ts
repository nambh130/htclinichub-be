import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetPaymentsDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(String(value)))
  @IsNumber()
  minAmount?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(String(value)))
  @IsNumber()
  maxAmount?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(String(value)))
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(String(value)))
  @IsNumber()
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
