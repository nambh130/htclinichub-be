import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUrl,
  Min,
  IsObject,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentProvider } from '../enums';

export class CreatePaymentDto {
  @IsString()
  orderId: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string = 'VND';

  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsUUID()
  clinicId?: string;

  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @IsOptional()
  @IsUrl()
  returnUrl?: string;

  @IsOptional()
  @IsUrl()
  cancelUrl?: string;

  @IsOptional()
  @IsUrl()
  notifyUrl?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
