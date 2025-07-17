import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ICDDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}

export class UpdateMedicalRecordDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ICDDto)
  icd: ICDDto;

  @IsOptional()
  @IsString()
  symptoms: string;

  @IsOptional()
  @IsString()
  diagnosis: string;

  @IsOptional()
  @IsString()
  treatmentDirection: string;

  @IsOptional()
  @IsString()
  next_appoint: string;
}
