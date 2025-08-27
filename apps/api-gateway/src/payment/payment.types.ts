import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsArray,
  IsNumber,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentType {
  APPOINTMENT_FEE = 'APPOINTMENT_FEE',
  LAB_ORDER_ITEM = 'LAB_ORDER_ITEM',
  OTHER = 'OTHER',
}

export enum PaymentMethod {
  BANKING = 'BANKING',
  CASH = 'CASH',
}

export class StorePayOSCredentialsDto {
  @IsUUID()
  @IsNotEmpty()
  clinicId: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @IsString()
  @IsNotEmpty()
  checksumKey: string;
}

export class PaymentItemDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsEnum(PaymentType)
  type: PaymentType;

  @IsOptional()
  @IsString()
  appointmentId?: string;

  @IsOptional()
  @IsString()
  labOrderItemId?: string;

  @IsOptional()
  @IsString()
  labOrderId?: string;
}

export class CreatePaymentLinkDto {
  @IsUUID()
  clinicId: string;

  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @IsOptional()
  @IsString()
  orderCode?: string;

  @IsNumber()
  amount: number;

  @IsString()
  description: string;

  @IsString()
  returnUrl: string;

  @IsString()
  cancelUrl: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentItemDto)
  items?: PaymentItemDto[];

  @IsOptional()
  @IsString()
  buyerName?: string;

  @IsOptional()
  @IsString()
  buyerEmail?: string;

  @IsOptional()
  @IsString()
  buyerPhone?: string;

  @IsOptional()
  @IsString()
  buyerAddress?: string;

  @IsOptional()
  @IsNumber()
  expiredAt?: number;
}

export class GetPaymentsDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  maxAmount?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  searchType?: 'all' | 'doctor' | 'payment';

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: string;

  @IsOptional()
  page?: string;

  @IsOptional()
  limit?: string;
}

export class GetTransactionsDto {
  @IsOptional()
  @IsString()
  transactionType?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  maxAmount?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class GetPaymentStatisticsDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class CreateCashPaymentDto {
  @IsUUID()
  clinicId: string;

  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @IsNumber()
  amount: number;

  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentItemDto)
  items?: PaymentItemDto[];

  @IsOptional()
  @IsString()
  buyerName?: string;

  @IsOptional()
  @IsString()
  buyerEmail?: string;

  @IsOptional()
  @IsString()
  buyerPhone?: string;

  @IsOptional()
  @IsString()
  buyerAddress?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
