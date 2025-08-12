import { IsMongoId, IsArray, ArrayNotEmpty, IsString, IsEnum } from "class-validator";
import { Type } from "class-transformer";
import { Types } from "mongoose";
import { TestEnum, TestType } from "../../lab-test/models/lab-test.schema";

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

  @IsEnum(Object.values(TestEnum))
  testType: TestType
}
