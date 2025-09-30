import {
  IsMongoId,
  IsNumber,
  IsEnum,
  ValidateNested,
  Min,
  Max,
  IsDefined,
  IsString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class BloodPressureDto {
  @IsNumber()
  @Min(0)
  systolic: number;

  @IsNumber()
  @Min(0)
  diastolic: number;
}

class GlucoseLevelDto {
  @IsNumber()
  @Min(0)
  min: number;

  @IsNumber()
  @Min(0)
  max: number;
}

export class InputVitalDto {
  @IsMongoId()
  patientId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  spo2: number;

  @IsNumber()
  @Min(0)
  heartRate: number;

  @IsNumber()
  @Min(0)
  respiratoryRate: number;

  @IsNumber()
  temperature: number;

  @IsNumber()
  weight: number;

  @IsNumber()
  height: number;

  @IsNumber()
  bmi: number;

  @ValidateNested()
  @Type(() => GlucoseLevelDto)
  glucoseLevel: GlucoseLevelDto;

  @ValidateNested()
  @Type(() => BloodPressureDto)
  bloodPressure: BloodPressureDto;

  // @IsEnum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
  // bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

  @IsEnum(['wearable', 'manual', 'nurse'])
  source: 'wearable' | 'manual' | 'nurse';

  @IsOptional()
  @IsString()
  mRId: string;
}
