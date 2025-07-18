import { IsEnum, IsOptional, IsString } from "class-validator";
import { TestEnum, TestType } from "../models/lab-test.schema";

export class FindLabTestDto {

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

  @IsOptional()
  @IsEnum(TestEnum)
  testType?: TestType
}

