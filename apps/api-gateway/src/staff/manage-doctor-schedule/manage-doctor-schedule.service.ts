import { TokenPayload, } from '@app/common';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ManageDoctorScheduleService {
    constructor(private readonly httpService: HttpService) { }

    async getViewWorkingShiftService(
        doctorId: string,
        user: TokenPayload,
    ) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`/manage-doctor-schedule/doctor-view-working-shift/${doctorId}`)
            );
            return response.data;
        } catch (error) {
            console.error('Error retrieving working shift:', error.response?.data || error.message);
            throw error;
        }
    }

    async getDetailShift(
        shiftId: string,
        user: TokenPayload,
    ) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`/manage-doctor-schedule/detail-working-shift/${shiftId}`)
            );
            return response.data;
        } catch (error) {
            console.error('Error retrieving working shift:', error.response?.data || error.message);
            throw error;
        }
    }
}