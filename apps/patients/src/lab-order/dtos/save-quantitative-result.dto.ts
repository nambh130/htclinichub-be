import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ReferenceRangeDto {
  @IsNumber()
  low: number;

  @IsNumber()
  high: number;
}

class LabResultFieldDto {
  @IsString()
  @IsNotEmpty()
  fieldName: string;

  @IsString()
  @IsNotEmpty()
  value: string | number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReferenceRangeDto)
  referenceRange?: ReferenceRangeDto;

  @IsOptional()
  @IsString()
  takenByMachine?: string;
}

export class SaveQuantitativeResultDto {
  @IsMongoId()
  orderId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabResultFieldDto)
  result: LabResultFieldDto[];

  @IsMongoId()
  doctorId?: string;
}
