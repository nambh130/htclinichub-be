import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEmail, IsBoolean, MaxLength, Matches, Length } from 'class-validator';

export class CreatePatientDto {
  @IsNumber()
  @IsNotEmpty()
  patient_account_id: number;

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

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'Phone must contain only numbers' })
  @Length(10, 10, { message: 'Phone must be exactly 10 digits' })
  phone: string;

  @IsBoolean()
  @IsOptional()
  gender: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  nation: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  work_address: string;

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