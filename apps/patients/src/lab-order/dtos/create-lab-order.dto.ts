import { IsMongoId, IsArray, ArrayNotEmpty, IsString } from "class-validator";
import { Type } from "class-transformer";
import { Types } from "mongoose";

export class CreateManyLabOrderDto {
  @IsMongoId()
  medicalReport: Types.ObjectId;

  @IsString()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  @Type(() => String)
  labTest: Types.ObjectId[];

  @IsString()
  clinicId: string
}
