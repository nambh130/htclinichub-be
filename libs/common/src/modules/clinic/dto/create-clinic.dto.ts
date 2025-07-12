import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateClinicDto {
  @IsString()
  name: string;

  @IsString()
  location: string;

  @IsUUID()
  @IsOptional()
  owner: string;
}
