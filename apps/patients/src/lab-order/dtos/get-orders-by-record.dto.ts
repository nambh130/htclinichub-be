import { IsMongoId, IsNumber, IsOptional } from "class-validator";
import { Types } from "mongoose";

export class GetOrdersByRecordDto {
  @IsMongoId()
  recordId: Types.ObjectId

  @IsNumber()
  @IsOptional()
  limit: number

  @IsNumber()
  @IsOptional()
  page: number
}
