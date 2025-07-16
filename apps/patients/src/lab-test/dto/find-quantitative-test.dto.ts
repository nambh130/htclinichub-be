import { IsOptional, IsString } from "class-validator";

export class FindQuantitativeTestDto {

  @IsString()
  clinicId: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  code?: string

  @IsString()
  @IsOptional()
  page?: number;
  
  @IsString()
  @IsOptional()
  limit?: number;
}
