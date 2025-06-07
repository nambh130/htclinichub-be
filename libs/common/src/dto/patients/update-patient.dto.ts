import { IsOptional, IsString, IsBoolean, Matches, Length } from 'class-validator';

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  fullname?: string;

  @IsOptional()
  @IsString()
  relation?: string;

  @IsOptional()
  @IsString()
  ethnicity?: string;

  @IsOptional()
  @IsString()
  marital_status?: string;

  @IsOptional()
  @IsString()
  address1?: string;

  @IsOptional()
  @IsString()
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
  @IsString()
  nation?: string;

  @IsOptional()
  @IsString()
  work_address?: string;
}