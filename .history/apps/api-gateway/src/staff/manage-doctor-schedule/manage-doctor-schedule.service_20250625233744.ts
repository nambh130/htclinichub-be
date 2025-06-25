import {
    AUTH_SERVICE,
    STAFF_SERVICE,
    UserDocument,
} from '@app/common';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka, Payload } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ManageDoctorScheduleService {
    constructor(private readonly httpService: HttpService) { }


    async getViewWorkingShiftService(
        doctorId: string,
        user: UserDocument
    ) {
        try {
            const data = {
                doctorId: doctorId,
                userId: user._id.toString()
            }
            const response = await firstValueFrom(
                this.httpService.get('/doctor/doctor-view-working-shift', data),
            );
            return response.data;
        } catch (error) {
            console.error('Error retrieving patient:', error);
            throw error;
        }
    }

    async getDetailShift(
        shiftId: string,
        userId: string,
    ) {
        try {
            const result = await firstValueFrom(
                this.httpService.get('detail-working-shift', { shiftId, userId })
            );
            return result;
        } catch (error) {
            console.error('Error retrieving patient:', error);
            throw error;
        }
    }
}