import { LabStatusEnum, LabStatusType } from "@app/common";
import { IsEnum, IsMongoId, IsString } from "class-validator";

export class UpdateOrderItemStatusDto {
  @IsEnum(LabStatusEnum)
  status: LabStatusType

  @IsString()
  clinicId: string
}
