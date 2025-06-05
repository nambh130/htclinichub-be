import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEmail, IsBoolean, MaxLength } from 'class-validator';

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

  @IsString()
  @IsOptional()
  @MaxLength(500)
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
}