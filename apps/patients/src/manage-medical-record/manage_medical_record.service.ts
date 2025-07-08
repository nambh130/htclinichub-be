import { Inject, Injectable, BadRequestException, OnModuleInit, NotFoundException } from '@nestjs/common';
import { AUTH_SERVICE, FavouriteDoctorDto, PATIENTS_TO_STAFF_SERVICE } from '@app/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { FavouriteDoctor } from '../models/favourite_doctor.entity';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ManageMedicalReportRepository } from './manage_medical_record.repository';
import { Types } from 'mongoose';

@Injectable()
export class ManageMedicalRecordService {
    constructor(
        private readonly manageMedicalReportRepository: ManageMedicalReportRepository,
        @Inject(PATIENTS_TO_STAFF_SERVICE)
        private readonly httpService: HttpService
    ) { }
    async getMedicalRecordsByUserId(userId: string) {
        try {
            const records = await this.manageMedicalReportRepository.findAndSort(
                {
                    patient_id: new Types.ObjectId(userId),
                },
                {
                    sort: { createdAt: -1 },
                }
            );

            if (!records || records.length === 0) {
                throw new NotFoundException(`No medical records found for patient ID ${userId}`);
            }

            return records;
        } catch (error) {
            console.error('Error in getFavouriteDoctorsList:', error);
            throw error;
        }
    }
}
