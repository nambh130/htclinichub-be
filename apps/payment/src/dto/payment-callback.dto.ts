import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus, PaymentProvider } from '../enums';

export class PaymentCallbackDto {
  @IsString()
  paymentId: string;

  @IsOptional()
  @IsString()
  externalPaymentId?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  errorCode?: string;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @IsOptional()
  @IsString()
  signature?: string;

  @IsOptional()
  @IsObject()
  rawData?: any;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}

export class WebhookDto {
  @IsObject()
  data: any;

  @IsOptional()
  @IsString()
  signature?: string;

  @IsOptional()
  @IsString()
  timestamp?: string;

  @IsEnum(PaymentProvider)
  provider: PaymentProvider;
}
