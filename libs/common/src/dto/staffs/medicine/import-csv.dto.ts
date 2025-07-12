import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class ImportMedicineDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  concentration: string;

  @IsOptional()
  @IsString()
  ingredient: string;

  @IsOptional()
  @IsString()
  unit: string;

  @IsOptional()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  timesPerDay: number;

  @IsOptional()
  @IsString()
  dosePerTime: string;

  @IsOptional()
  @IsString()
  schedule: string;

  @IsOptional()
  @IsEnum(['DANG_SU_DUNG', 'TAM_NGUNG', 'NGUNG_LUU_HANH'])
  status: 'DANG_SU_DUNG' | 'TAM_NGUNG' | 'NGUNG_LUU_HANH' = 'DANG_SU_DUNG';
}
