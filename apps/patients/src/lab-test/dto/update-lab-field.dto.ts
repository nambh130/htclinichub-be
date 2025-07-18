import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateLabFieldDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  loincCode?: string;

  @IsString()
  @IsOptional()
  unit?: string

  @IsNumber()
  @IsOptional()
  lowReferenceRange?: number

  @IsNumber()
  @IsOptional()
  highReferenceRange?: number
}

