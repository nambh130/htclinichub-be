import { IsString, IsNumber, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateClinicScheduleRuleDto {
    @IsOptional()
    @IsString()
    duration?: string;

    @IsOptional()
    @IsNumber()
    space: number;

    @IsOptional()
    @IsString()
    open_time?: string;

    @IsOptional()
    @IsString()
    close_time?: string;

    @IsOptional()
    @IsString()
    break_time?: string;
}
