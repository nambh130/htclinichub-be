import {
    AUTH_SERVICE,
    CreatePatientDto,
    UpdatePatientDto,
    PATIENT_SERVICE,
    TokenPayload,
    MedicalRecord,
    StaffInfo,
} from '@app/common';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { StaffService } from '../../staff/staff.service';

@Injectable()
export class ManageMedicalRecordService {
    constructor(
        @Inject(PATIENT_SERVICE) private readonly httpService: HttpService,
        // private readonly clinicService: ClinicService,
        private readonly staffService: StaffService,
    ) { }

    async getMedicalRecordsByUserId(
        userId: string,
        currentUser: TokenPayload,
    ) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(
                    `/manage-medical-record/get-medical-records-by-userId/${userId}`,
                ),
            );

            const records = response.data as any[];

            for (const record of records) {
                const doctorId = record?.doctor_id;

                if (doctorId) {
                    const doctorDetails = await this.staffService.getDoctorDetailsById(doctorId);
                    console.log('[DEBUG] doctorDetails:', doctorDetails);
                    record.doctor_name = doctorDetails.account?.staffInfo?.full_name || null;
                } else {
                    record.doctor_name = null;
                }
            }

            return records;
        } catch (error) {
            console.error('Error retrieving medical records:', error?.response?.data || error);
            throw error;
        }
    }


}
