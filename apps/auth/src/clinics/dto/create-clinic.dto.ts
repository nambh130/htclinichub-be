import { IsOptional, IsUUID } from 'class-validator';

export class CreateClinicDto {
  id?: string;

  @IsUUID()
  @IsOptional()
  ownerId: string;
}
