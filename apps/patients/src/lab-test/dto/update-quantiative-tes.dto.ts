import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Types } from 'mongoose';

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

  @IsOptional()
  template?: Types.ObjectId[];
}
