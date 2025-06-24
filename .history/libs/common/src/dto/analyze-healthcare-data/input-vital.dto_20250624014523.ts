import {
  IsMongoId,
  IsNumber,
  IsEnum,
  ValidateNested,
  Min,
  Max,
  IsDefined,
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

export class InputVitalDto {
  // @IsMongoId()
  // patientId: string;

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

  @ValidateNested()
  @Type(() => BloodPressureDto)
  bloodPressure: BloodPressureDto;

  @IsEnum(['wearable', 'manual', 'nurse'])
  source: 'wearable' | 'manual' | 'nurse';
}
