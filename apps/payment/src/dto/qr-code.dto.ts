import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsUrl,
  IsDate,
  IsBoolean,
  IsObject,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GenerateQRCodeDto {
  @IsString()
  paymentId: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string = 'VND';

  @IsOptional()
  @IsString()
  merchantId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiryTime?: Date;

  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(1000)
  @Type(() => Number)
  size?: number = 256;

  @IsOptional()
  @IsEnum(['PNG', 'SVG', 'JPEG'])
  format?: 'PNG' | 'SVG' | 'JPEG' = 'PNG';

  @IsOptional()
  @IsEnum(['L', 'M', 'Q', 'H'])
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H' = 'M';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  @Type(() => Number)
  margin?: number = 4;

  @IsOptional()
  @IsObject()
  color?: {
    dark?: string;
    light?: string;
  };
}

export class QRCodeResponseDto {
  @IsUrl()
  qrCodeUrl: string;

  @IsString()
  qrCodeData: string;

  @IsDate()
  @Type(() => Date)
  expiryTime: Date;

  @IsBoolean()
  isValid: boolean;

  @IsOptional()
  @IsString()
  paymentId?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class QRCodeValidationDto {
  @IsString()
  qrCodeData: string;

  @IsOptional()
  @IsString()
  paymentId?: string;
}
