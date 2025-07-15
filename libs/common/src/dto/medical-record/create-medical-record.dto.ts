import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateMedicalRecordDto {
  @IsNotEmpty()
  @IsString()
  patient_id: string;
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  appointment_id: string;
}
