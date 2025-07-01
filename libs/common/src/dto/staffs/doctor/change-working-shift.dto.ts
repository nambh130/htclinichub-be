import { IsString, IsDateString, IsBoolean, IsOptional, Matches } from 'class-validator';

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

    @IsBoolean()
    @IsOptional()
    isActivate?: boolean;

}
