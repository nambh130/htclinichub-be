import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class DoctorSpecializeDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsString()
  @MaxLength(100)
  description: string;

  @IsOptional()
  @IsString()
  image_id?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  @MaxLength(2048)
  certificate_url?: string;
}

export class UpdateSpecializeDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  description?: string;

  @IsOptional()
  @IsString()
  image_id?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  @MaxLength(2048)
  certificate_url?: string;
}
