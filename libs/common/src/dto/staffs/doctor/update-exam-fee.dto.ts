import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';

export class UpdateExamFeeDto {
  @IsNumber()
  @IsPositive()
  examFee: number;

  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsOptional()
  @IsString()
  clinicId?: string;
}
