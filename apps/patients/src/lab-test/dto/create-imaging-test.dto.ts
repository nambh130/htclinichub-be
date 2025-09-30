import { IsOptional, IsString, IsArray, IsMongoId, IsNumber, Min } from 'class-validator';
import { Types } from 'mongoose';

export class CreateImagingTestDto {
  @IsString()
  name: string;

  @IsString()
  clinicId: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsNumber()
  @Min(0)
  price: number

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  conclusion?: string;
}

