import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class UpdateMedicineDto {
  @IsOptional()
  @IsString()
  code: string;

  @IsOptional()
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
  @IsString()
  madeIn: string;

  @IsOptional()
  @IsEnum(['Thuốc', 'Thực phẩm chức năng', 'Vaccine', 'Dược mỹ phẩm', 'Dung dịch tiêm truyền', 'Hóa chất'])
  category: 'Thuốc' | 'Thực phẩm chức năng' | 'Vaccine' | 'Dược mỹ phẩm' | 'Dung dịch tiêm truyền' | 'Hóa chất';

  @IsOptional()
  @IsEnum(['DANG_SU_DUNG', 'TAM_NGUNG', 'NGUNG_LUU_HANH'])
  status: 'DANG_SU_DUNG' | 'TAM_NGUNG' | 'NGUNG_LUU_HANH';
}
