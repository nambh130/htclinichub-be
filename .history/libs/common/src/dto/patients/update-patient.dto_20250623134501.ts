import {
  IsOptional,
  IsString,
  IsBoolean,
  Matches,
  Length,
  MaxLength,
  ValidateNested,
  IsDateString,
  IsNotEmpty,
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
  @MaxLength(255)
  relation?: string;

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

  // @IsString()
  // @IsNotEmpty()
  // createdBy: string;
}
