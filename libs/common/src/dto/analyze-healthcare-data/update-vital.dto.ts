import {
  IsMongoId,
  IsNumber,
  IsEnum,
  ValidateNested,
  Min,
  Max,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class BloodPressureDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  systolic?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  diastolic?: number;
}

class GlucoseLevelDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  min?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  max?: number;
}

export class UpdateVitalDto {
  //   @IsOptional()
  //   @IsMongoId()
  //   patientId?: string;

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
  @IsNumber()
  @Min(0)
  @Max(100)
  min?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  max?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  bmi?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => GlucoseLevelDto)
  glucoseLevel?: GlucoseLevelDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BloodPressureDto)
  bloodPressure?: BloodPressureDto;

  @IsOptional()
  @IsEnum(['wearable', 'manual', 'nurse'])
  source?: 'wearable' | 'manual' | 'nurse';
}
