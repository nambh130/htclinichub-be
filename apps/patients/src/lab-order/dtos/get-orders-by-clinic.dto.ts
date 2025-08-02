import { IsDate, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { Types } from "mongoose";
import { TestEnum, TestType } from "../../lab-test/models/lab-test.schema";
import { Type } from "class-transformer";

export class GetOrdersByClinicDto {
  @IsUUID()
  clinicId: string

  @IsMongoId()
  @IsOptional()
  patientId?: string

  @IsMongoId()
  @IsOptional()
  medicalRecordId?: string

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsEnum(Object.values(TestEnum))
  testType?: TestType

  @IsOptional()
  @IsString()
  labOrderBarcode?: string
}

