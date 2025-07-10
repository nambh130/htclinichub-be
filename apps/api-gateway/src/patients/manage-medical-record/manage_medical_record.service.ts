import {
    AUTH_SERVICE,
    CreatePatientDto,
    UpdatePatientDto,
    PATIENT_SERVICE,
    TokenPayload,
} from '@app/common';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ManageMedicalRecordService {
    constructor(
        @Inject(PATIENT_SERVICE) private readonly httpService: HttpService) { }

    async getMedicalRecordsByUserId(
        userId: string,
        currentUser: TokenPayload,
    ) {
        try {
            const result = await firstValueFrom(
                this.httpService.get(`/manage-medical-record/get-medical-records-by-userId/${userId}`)
            );
            return result.data;
        } catch (error) {
            console.error('Error retrieving patient:', error);
            throw error;
        }
    }
}
