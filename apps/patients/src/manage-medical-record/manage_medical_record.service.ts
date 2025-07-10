import { Inject, Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { AUTH_SERVICE, FavouriteDoctorDto, PATIENTS_TO_STAFF_SERVICE } from '@app/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { FavouriteDoctor } from '../models/favourite_doctor.entity';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ManageMedicalReportRepository } from './manage_medical_record.repository';

@Injectable()
export class ManageMedicalRecordService {
    constructor(
        private readonly manageMedicalReportRepository: ManageMedicalReportRepository,
        @Inject(PATIENTS_TO_STAFF_SERVICE)
        private readonly httpService: HttpService
    ) { }
    async getMedicalRecordsByUserId(userId: string) {
        try {
            // const favs = await this.manageMedicalReportRepository.find({
            //     patient_id: userId,
            // });

            // const doctorIds = favs.map((f) => f.doctor_id);

            // console.log('Doctor IDs:', doctorIds);

            // return {
            //     doctorIds,
            //     total: doctorIds.length
            // };
            return userId + "thành công";
        } catch (error) {
            console.error('Error in getFavouriteDoctorsList:', error);
            throw error;
        }
    }
}
