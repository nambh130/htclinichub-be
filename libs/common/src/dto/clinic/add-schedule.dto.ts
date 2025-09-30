import { IsString, IsNumber, ValidateNested, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClinicScheduleRuleDto {
    @IsNotEmpty()
    @IsString()
    duration: string;

    @IsNotEmpty()
    @IsNumber()
    space: number;

    @IsNotEmpty()
    @IsString()
    open_time: string;

    @IsNotEmpty()
    @IsString()
    close_time: string;

    @IsOptional()
    @IsString()
    break_time?: string;
}
