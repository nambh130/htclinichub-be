import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class StoreCredentialsDto {
  @IsUUID()
  @IsNotEmpty()
  clinicId: string;

  @IsString()
  @IsNotEmpty()
  provider: string;

  @IsNotEmpty()
  credentials: Record<string, string>;
}

export class StorePayOSCredentialsDto {
  @IsUUID()
  @IsNotEmpty()
  clinicId: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @IsString()
  @IsNotEmpty()
  checksumKey: string;
}
