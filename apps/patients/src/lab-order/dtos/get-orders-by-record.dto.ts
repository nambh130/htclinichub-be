import { IsEnum, IsMongoId, IsNumber, IsOptional } from "class-validator";
import { Types } from "mongoose";
import { TestEnum, TestType } from "../../lab-test/models/lab-test.schema";

export class GetOrdersByRecordDto {
  @IsMongoId()
  recordId: Types.ObjectId

  @IsNumber()
  @IsOptional()
  limit: number

  @IsNumber()
  @IsOptional()
  page: number

  @IsEnum(Object.values(TestEnum))
  testType: TestType
}
