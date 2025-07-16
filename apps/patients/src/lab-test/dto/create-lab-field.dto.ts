import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateLabFieldDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  loincCode?: string;

  @IsString()
  unit: string

  @IsNumber()
  lowReferenceRange: number

  @IsNumber()
  highReferenceRange: number

  @IsString()
  clinicId: string
}
