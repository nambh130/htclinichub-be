import { Inject, Injectable, BadRequestException, OnModuleInit, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { ClinicScheduleRuleRepository } from './clinic_schedule_rule.repository';

@Injectable()
export class ClinicScheduleRuleService {
    constructor(
        private readonly clinicScheduleRuleRepository: ClinicScheduleRuleRepository,
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
            }
            return data;
        } catch (error) {
            console.error('Error in getGroupedMedicalRecordsByUserId:', error);
            throw error;
        }
    }

}

