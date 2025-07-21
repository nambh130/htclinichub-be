import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class PrescribedMedicineDto {
  @IsNumber()
  @IsNotEmpty()
  day: number;

  @IsString()
  @IsNotEmpty()
  medicine_id: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  timesPerDay: number;

  @IsString()
  @IsNotEmpty()
  dosePerTime: string;

  @IsString()
  @IsNotEmpty()
  schedule: string;
}

export class CreatePrescriptionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescribedMedicineDto)
  prescribedMedicines: PrescribedMedicineDto[];

  @IsString()
  @IsNotEmpty()
  note: string;
}
