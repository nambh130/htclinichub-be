import { Inject, Injectable, BadRequestException, OnModuleInit, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { ClinicScheduleRuleRepository } from './clinic_schedule_rule.repository';
import { CreateClinicScheduleRuleDto, UpdateClinicScheduleRuleDto } from '@app/common/dto/clinic';
import { ClinicRepository } from '@clinics/clinic.repository';
import { ClinicScheduleRule } from '@clinics/models';

@Injectable()
export class ClinicScheduleRuleService {
    constructor(
        private readonly clinicScheduleRuleRepository: ClinicScheduleRuleRepository,
        private readonly clinicRepository: ClinicRepository,

    ) { }
    async getClinicScheduleRuleByClinicId(clinicId: string) {
        try {
            const result = await this.clinicScheduleRuleRepository.findOne({
                clinic: {
                    id: clinicId,
                },
            },
                ['clinic']
            );
            // const { name, location, phone, email, ownerId } = result.clinic;

            // return {
            //     name,
            //     location,
            //     phone,
            //     email,
            //     ownerId,
            // };

            const data = {
                id: result.id,
                clinicId: result.clinic.id,
                clinic_name: result.clinic.name,
                clinic_location: result.clinic.location,
                clinic_phone: result.clinic.phone,
                clinic_email: result.clinic.email,
                clinic_owner_id: result.clinic.ownerId,
                open_time: result.open_time,
                close_time: result.close_time,
                break_time: result.break_time,
                duration: result.duration,
                space: result.space
            }
            return data;
        } catch (error) {
            console.error('Error in getGroupedMedicalRecordsByUserId:', error);
            throw error;
        }
    }

    async createClinicScheduleRuleByClinicId(
        clinicId: string,
        dto: CreateClinicScheduleRuleDto,
    ) {
        const clinic = await this.clinicRepository.findOne({ id: clinicId });
        if (!clinic) {
            throw new NotFoundException('clinic not found');
        }

        const existingRule = await this.clinicScheduleRuleRepository.findOne({
            clinic: { id: clinicId }
        },
        );

        if (existingRule) {
            throw new BadRequestException('Clinic already has a schedule rule');
        }

        const rule = new ClinicScheduleRule();
        rule.clinic = clinic;
        rule.duration = dto.duration;
        rule.space = dto.space;
        rule.open_time = dto.open_time;
        rule.close_time = dto.close_time;
        rule.break_time = dto.break_time ?? null; // nếu optional

        const result = await this.clinicScheduleRuleRepository.create(rule);

        return result;
    }

    async updateClinicScheduleRuleByClinicId(
        clinicId: string,
        dto: UpdateClinicScheduleRuleDto,
    ) {
        const clinic = await this.clinicRepository.findOne({ id: clinicId });
        if (!clinic) {
            throw new NotFoundException('Clinic not found');
        }

        const existingRule = await this.clinicScheduleRuleRepository.findOne({
            clinic: { id: clinicId }
        },
        );

        return this.clinicScheduleRuleRepository.update(existingRule, {
            ...dto,
        });
    }
}

