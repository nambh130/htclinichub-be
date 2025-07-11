import {
    AUTH_SERVICE,
    CreatePatientDto,
    UpdatePatientDto,
    PATIENT_SERVICE,
    TokenPayload,
    CLINIC_SERVICE,
} from '@app/common';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, OnModuleInit, Catch } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ClinicScheduleRuleApiService {
    constructor(
        @Inject('CLINIC_HTTP_SERVICE') private readonly httpService: HttpService,
    ) { }

    async getClinicScheduleRuleByClinicId(clinicId: string, userId: string) {
        const result = await firstValueFrom(
            this.httpService.get(`clinic-schedule-rule/get-schedule-rule/${clinicId}`),
        );
        
        return result.data;
    }
}