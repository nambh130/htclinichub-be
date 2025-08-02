import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

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

export class UpdateQuantitativeTestDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ValidateNested({ each: true })
  @Type(() => LabFieldDto)
  @IsOptional()
  template?: LabFieldDto[];
}
