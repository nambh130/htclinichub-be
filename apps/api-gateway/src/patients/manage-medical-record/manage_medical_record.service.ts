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

            for (const patient of records) {
                for (const record of patient.medicalRecords) {
                    const doctorId = record?.doctor_id;

                    if (doctorId) {
                        const doctorDetails = await this.staffService.getDoctorDetailsById(doctorId);
                        console.log('[DEBUG] doctorDetails:', doctorDetails);

                        record.doctorInfo = {
                            doctorId: doctorId,
                            doctorName: doctorDetails.account?.staffInfo?.full_name || null,
                            doctorEmail: doctorDetails.account?.email || null,
                            doctorPhone: doctorDetails.account?.staffInfo?.phone || null,
                        };
                    } else {
                        record.doctorInfo = null;
                    }

                    // Xóa các trường lẻ nếu không cần
                    delete record.doctor_id;
                    delete record.doctor_name;
                    delete record.doctor_email;
                    delete record.doctor_phone;
                }
            }

            return records;
        } catch (error) {
            console.error('Error retrieving medical records:', error?.response?.data || error);
            throw error;
        }
    }

    async getDetailMedicalRecordsBymRId(
        mRid: string,
        currentUser: TokenPayload,
    ) {
        try {
            const response = await firstValueFrom(
                this.httpService.get(
                    `/manage-medical-record/get-detail-medical-record/${mRid}`,
                ),
            );

            const record = response.data;

            // ===== Doctor Info đơn giản =====
            let doctorInfo: {
                id: string;
                name: string | null;
                email: string | null;
                phone: string | null;
            } | null = null;

            if (record?.doctor_id) {
                const doctorDetails = await this.staffService.getDoctorDetailsById(record.doctor_id);
                const account = doctorDetails?.account;

                doctorInfo = {
                    id: record.doctor_id,
                    name: account?.staffInfo?.full_name || null,
                    email: account?.email || null,
                    phone: account?.staffInfo?.phone || null,
                };
            }

            // ===== Kết quả chi tiết cho 1 lần khám =====
            return {
                _id: record._id,
                patient_id: record.patient_id,
                patient_name: record.patient_name,
                gender: record.gender,
                dOB: record.dOB,
                bloodGroup: record.bloodGroup,
                symptoms: record.symptoms,
                diagnosis: record.diagnosis,
                next_appoint: record.next_appoint,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
                doctorInfo,
            };
        } catch (error) {
            console.error('Error retrieving medical records:', error?.response?.data || error);
            throw error;
        }
    }


}
