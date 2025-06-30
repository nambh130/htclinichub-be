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
  IsNumber,
  IsEnum,
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
  @IsEnum(['Chính chủ', 'Vợ', 'Con', 'Bố', 'Mẹ', 'Ông', 'Bà', 'Chị', 'Anh', 'Em', 'Cháu', 'Khác'])
  relation: 'Chính chủ' | 'Vợ' | 'Con' | 'Bố' | 'Mẹ' | 'Ông' | 'Bà' | 'Chị' | 'Anh' | 'Em' | 'Cháu' | 'Khác';

  @IsString()
  @IsOptional()
  @Matches(/^\d+$/, { message: 'CCCD must contain only numbers' })
  @Length(12, 12, { message: 'CCCD must be exactly 12 digits' })
  citizen_id: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d+$/, { message: 'BHYT must contain only numbers' })
  @Length(15, 15, { message: 'BHYT must be exactly 15 digits' })
  health_insurance_id: string

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

  @IsEnum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

  // @IsString()
  // @IsNotEmpty()
  // createdBy: string;
}
