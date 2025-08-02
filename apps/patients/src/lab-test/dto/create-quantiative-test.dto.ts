import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ReferenceRangeDto {
  @IsNumber()
  low: number;

  @IsNumber()
  high: number;
}

class LabFieldDto {
  @IsOptional()
  @IsString()
  loincCode?: string;

  @IsString()
  name: string;

  @IsString()
  unit: string;

  @ValidateNested()
  @Type(() => ReferenceRangeDto)
  referenceRange: ReferenceRangeDto;
}

export class CreateQuantitativeTestDto {
  @IsString()
  clinicId: string;

  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  code?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabFieldDto)
  @IsOptional()
  template?: LabFieldDto[];
}
