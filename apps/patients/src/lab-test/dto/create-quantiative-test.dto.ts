import { IsOptional, IsString, IsArray, IsMongoId, IsNumber, Min } from 'class-validator';
import { Types } from 'mongoose';

export class CreateQuantitativeTestDto {
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
  @IsArray()
  @IsMongoId({ each: true })
  template?: Types.ObjectId[];
}
