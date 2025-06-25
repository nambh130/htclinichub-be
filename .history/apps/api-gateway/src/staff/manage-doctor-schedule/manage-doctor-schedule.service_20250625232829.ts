import {
    AUTH_SERVICE,
    STAFF_SERVICE,
} from '@app/common';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ManageDoctorScheduleService{
   constructor(private readonly httpService: HttpService) {}
 

    async getViewWorkingShiftService(
        doctorId: string,
        userId: string,
    ) {
        try {
            const result = await firstValueFrom(
                this.staffClient.send('doctor-view-working-shift', { doctorId, userId })
            );
            return result;
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
                this.staffClient.send('detail-working-shift', { shiftId, userId })
            );
            return result;
        } catch (error) {
            console.error('Error retrieving patient:', error);
            throw error;
        }
    }
}