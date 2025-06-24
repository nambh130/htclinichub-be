import { IsMongoId, IsOptional, IsNumber, IsEnum, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class BloodPressureDto {
  @IsNumber()
  @Min(0)
  systolic: number;

  @IsNumber()
  @Min(0)
  diastolic: number;
}

export class InputVitalDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  spo2?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  heartRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  respiratoryRate?: number;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => BloodPressureDto)
  bloodPressure?: BloodPressureDto;

  @IsOptional()
  @IsEnum(['wearable', 'manual', 'nurse'])
  source?: 'wearable' | 'manual' | 'nurse';
}
