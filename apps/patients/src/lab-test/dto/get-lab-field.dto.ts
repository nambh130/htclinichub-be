import { IsOptional, IsString } from 'class-validator';

export class GetLabFieldDto {
  @IsString()
  clinicId: string;

  @IsString()
  @IsOptional()
  loincCode?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  page?: number;
  
  @IsString()
  @IsOptional()
  limit?: number;
}

