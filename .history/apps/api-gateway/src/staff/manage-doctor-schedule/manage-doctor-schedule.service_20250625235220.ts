import {
    UserDocument,
} from '@app/common';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ManageDoctorScheduleService {
    constructor(private readonly httpService: HttpService) { }

    async getViewWorkingShiftService(
        doctorId: string,
        user: UserDocument,
    ) {
        try {

            const params = {
                doctorId,
                userId: user._id.toString(),
            };
            const response = await firstValueFrom(
                this.httpService.get('/doctor/doctor-view-working-shift', { params }));
            return response.data;
        } catch (error) {
            console.error('Error retrieving working shift:', error.response?.data || error.message);
            throw error;
        }
    }

    async getDetailShift(
        shiftId: string,
        user: UserDocument,
    ) {
        try {
            const response = await firstValueFrom(
                this.httpService.get('/doctor/detail-working-shift', {
                    params: {
                        shiftId,
                        userId: user._id.toString(),
                    },
                }),
            );
            return response.data;
        } catch (error) {
            console.error('Error retrieving working shift:', error.response?.data || error.message);
            throw error;
        }
    }
}