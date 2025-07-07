import { IsString, IsDateString, IsBoolean, IsOptional, Matches, IsUUID, IsNotEmpty, IsNumber } from 'class-validator';

export class SetupWorkingShiftDto {
  @IsUUID()
  doctor_clinic_link_id: string;

  @IsDateString()
  startTime: string; // ISO format: '2025-07-01T08:00:00Z'

  @Matches(/^(\d{2}):([0-5][0-9]):([0-5][0-9])$/, {
    message: 'duration must be in format HH:MM:SS',
  })
  duration: string;

  @IsNotEmpty()
  @IsNumber()
  space: number;
}
