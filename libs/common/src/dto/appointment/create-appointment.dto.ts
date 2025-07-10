import { IsNotEmpty, IsString, IsUUID, MaxLength, IsOptional } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  patient_profile_id: string;

  @IsUUID()
  @IsNotEmpty()
  clinic_id: string;

  @IsUUID()
  @IsNotEmpty()
  doctor_id: string;

  @IsUUID()
  @IsNotEmpty()
  slot_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  symptoms: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string;
}
