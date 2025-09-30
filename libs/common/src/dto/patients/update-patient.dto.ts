import {
  IsOptional,
  IsString,
  IsBoolean,
  Matches,
  Length,
  MaxLength,
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
  allergies?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  personal_history?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  family_history?: string;
}

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  fullname?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['Chính chủ', 'Chồng', 'Vợ', 'Con', 'Bố', 'Mẹ', 'Ông', 'Bà', 'Chị', 'Anh', 'Em', 'Cháu', 'Khác'])
  relation?: 'Chính chủ' | 'Chồng' | 'Vợ' | 'Con' | 'Bố' | 'Mẹ' | 'Ông' | 'Bà' | 'Chị' | 'Anh' | 'Em' | 'Cháu' | 'Khác';

  @IsString()
  @IsOptional()
  @Matches(/^\d+$/, { message: 'CCCD must contain only numbers' })
  @Length(12, 12, { message: 'CCCD must be exactly 12 digits' })
  citizen_id?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d+$/, { message: 'BHYT must contain only numbers' })
  @Length(15, 15, { message: 'BHYT must be exactly 15 digits' })
  health_insurance_id?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ethnicity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  marital_status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address2?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'Phone must contain only numbers' })
  @Length(10, 10, { message: 'Phone must be exactly 10 digits' })
  phone?: string;

  @IsOptional()
  @IsBoolean()
  gender?: boolean;

  @IsOptional()
  @IsDateString()
  dOB?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  nation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  work_address?: string;

  @ValidateNested()
  @Type(() => MedicalHistoryDto)
  @IsOptional()
  medical_history?: MedicalHistoryDto;

  @IsOptional()
  @IsEnum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

  // @IsString()
  // @IsNotEmpty()
  // createdBy: string;
}
