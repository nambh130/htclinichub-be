import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus, PaymentProvider } from '../enums';

export class PaymentStatusDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsString()
  externalPaymentId?: string;

  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsString()
  currency: string;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  paymentUrl?: string;

  @IsOptional()
  @IsString()
  qrCodeUrl?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paidAt?: Date;

  @IsOptional()
  @IsString()
  failureReason?: string;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}

export class PaymentListDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentProvider)
  provider?: PaymentProvider;

  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  clinicId?: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fromDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  toDate?: Date;
}
