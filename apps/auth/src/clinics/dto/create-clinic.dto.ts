import { IsOptional, IsUUID } from "class-validator";

export class CreateClinicDto {
  @IsUUID()
  @IsOptional()
  owner: string
}
