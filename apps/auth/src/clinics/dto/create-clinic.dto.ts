import { IsNumber, IsString, IsUUID } from "class-validator";

export class CreateClinicDto {
  @IsString()
  name: string

  @IsString()
  location: string

  @IsUUID()
  owner: string
}
