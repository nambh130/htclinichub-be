import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  Matches,
  Length,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

class MedicalHistoryDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  allergies: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  personal_history: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  family_history: string;
}

export class CreatePatientDto {
  @IsString()
  @IsNotEmpty()
  patient_account_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  fullname: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  relation: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  ethnicity: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  marital_status: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  address1: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address2: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+$/, { message: 'Phone must contain only numbers' })
  @Length(10, 10, { message: 'Phone must be exactly 10 digits' })
  phone: string;

  @IsBoolean()
  @IsOptional()
  gender: boolean;

  @IsDateString()
  @IsOptional()
  dOB: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  nation: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  work_address: string;

  @ValidateNested()
  @Type(() => MedicalHistoryDto)
  @IsOptional()
  medical_history: MedicalHistoryDto;

  @IsString()
  @IsNotEmpty()
  createdBy: string;
}
