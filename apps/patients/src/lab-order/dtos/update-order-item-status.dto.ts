import { LabStatusEnum, LabStatusType } from "@app/common";
import { IsEnum } from "class-validator";

export class UpdateOrderItemStatusDto {
  @IsEnum(LabStatusEnum)
  status: LabStatusType
}
