import { IsOptional, IsUUID } from 'class-validator';

export class CreateClinicDto {
  id?: string;

  @IsUUID()
  @IsOptional()
  owner: string;
}
