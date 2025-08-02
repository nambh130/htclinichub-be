import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { SortOrder } from './get-payments.dto';

export enum TransactionType {
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  CHARGEBACK = 'CHARGEBACK',
  FEE = 'FEE',
}

export class GetTransactionsDto {
  @IsOptional()
  @IsEnum(TransactionType)
  transactionType?: TransactionType;

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
