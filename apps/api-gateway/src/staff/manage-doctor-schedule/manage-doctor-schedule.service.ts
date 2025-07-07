import { STAFF_SERVICE, TokenPayload, } from '@app/common';
import { ChangeWorkingShiftDto } from '@app/common/dto/staffs/doctor/change-working-shift.dto';
import { SetupWorkingShiftDto } from '@app/common/dto/staffs/doctor/setup-working-shift.dto';
import { HttpService } from '@nestjs/axios';
import { Injectable, Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ManageDoctorScheduleService {
    constructor(@Inject(STAFF_SERVICE) private readonly httpService: HttpService) { }

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
    async setUpWorkingShiftByDoctorId(
        dto: SetupWorkingShiftDto,
        doctorId: string,
        currentUser: TokenPayload,
    ) {
        try {
            const payload = {
                dto, currentUser
            }
            const response = await firstValueFrom(
                this.httpService.post(`/manage-doctor-schedule/setup-working-shift/${doctorId}`, payload)
            );
            console.log("Log: input ", payload)
            return response.data;
        } catch (error) {
            console.error('Error retrieving working shift:', error.response?.data || error.message);
            throw error;
        }
    }

    async changeWorkingShiftByDoctorId(
        dto: ChangeWorkingShiftDto,
        doctorId: string,
        shiftId: string,
        currentUser: TokenPayload,
    ) {
        try {
            const payload = {
                dto,
                currentUser
            };

            console.log("Log: input ", shiftId, doctorId, currentUser.userId)

            const response = await firstValueFrom(
                this.httpService.put(`/manage-doctor-schedule/${doctorId}/change-working-shift/${shiftId}`, payload)
            );

            return response.data;
        } catch (error) {
            console.error('Error retrieving working shift:', error.response?.data || error.message);
            throw error;
        }
    }

    async getShiftsInDate(date: string, user: TokenPayload) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`/manage-doctor-schedule/doctor/shifts-by-date/${date}`, {
                    params: {
                        doctorId: user.userId,
                    },
                }));

            return response.data;
        } catch (error) {
            console.error('Error retrieving working shift:', error.response?.data || error.message);
            throw error;
        }
    }
}