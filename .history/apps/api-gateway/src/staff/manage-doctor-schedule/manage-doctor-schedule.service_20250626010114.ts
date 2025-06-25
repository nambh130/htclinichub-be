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
                user: {
                    id: user._id,
                    type: user.type,
                },
            };
            
            const response = await firstValueFrom(
                this.httpService.get('/manage-doctor-schedule/doctor-view-working-shift', { params }));
            return response.data;
        } catch (error) {
            console.error('Error retrieving working shift:', error.response?.data || error.message);
            throw error;
        }
    }

    async getDetailShift(
        shiftId: string,
        user: To,
    ) {
        try {
            const response = await firstValueFrom(
                this.httpService.get('/manage-doctor-schedule/detail-working-shift', {
                    params: {
                        shiftId,
                        userId: user.id,
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