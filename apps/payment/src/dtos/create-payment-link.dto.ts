import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentType } from '../enums/payment-status.enum';

class PaymentItemDto {
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
