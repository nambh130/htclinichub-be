import { IsString, IsDateString, IsBoolean, IsOptional, Matches, IsNotEmpty, IsNumber, IsEnum } from 'class-validator';

export class ChangeWorkingShiftDto {
    @IsOptional()
    @IsDateString()
    startTime?: string; // ISO format: '2025-07-01T08:00:00Z'

    @IsString()
    @IsOptional()
    @Matches(/^(\d{2}):([0-5][0-9]):([0-5][0-9])$/, {
        message: 'duration must be in format HH:MM:SS',
    })
    duration?: string;

    @IsOptional()
    @IsEnum(['available', 'booked', 'cancelled'], {
        message: 'status must be one of: available, booked, or cancelled',
    })
    status?: 'available' | 'booked' | 'cancelled';
 
    @IsOptional()
    @IsNumber()
    space?: number;
}
