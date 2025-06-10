import { IsNumber, IsOptional, IsString, Matches } from "class-validator";

export class CreateClinicDto {
  @IsString()
  name: string

  @IsString()
  location: string

  @IsNumber()
  ownerId: number
}
