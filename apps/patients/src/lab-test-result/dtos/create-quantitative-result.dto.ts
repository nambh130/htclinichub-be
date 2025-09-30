import { IsArray, IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ReferenceRangeDto {
  @IsNumber()
  low: number;

  @IsNumber()
  high: number;
}

class FileObjectDto {
  @IsString()
  id: string;

  @IsString()
  url: string;
}

class LabResultFieldDto {
  @IsString()
  @IsNotEmpty()
  fieldName: string;

  @IsNotEmpty()
  @IsNumber({}, { message: 'value must be a number' })
  @Type(() => Number)
  value: number;

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

export class CreateQuantitativeResultDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabResultFieldDto)
  result: LabResultFieldDto[];

  @IsMongoId()
  orderItemId: string

  @IsBoolean()
  @IsOptional()
  accept?: boolean

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileObjectDto)
  uploadedResult?: FileObjectDto[];
}
