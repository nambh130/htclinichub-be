import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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
  name: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}

export class CreatePaymentLinkDto {
  @IsUUID()
  clinicId: string;

  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @IsString()
  orderCode: string;

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
