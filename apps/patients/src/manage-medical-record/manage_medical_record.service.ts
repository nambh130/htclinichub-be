import { Inject, Injectable, BadRequestException, OnModuleInit, NotFoundException } from '@nestjs/common';
import { AUTH_SERVICE, FavouriteDoctorDto, PATIENTS_TO_STAFF_SERVICE } from '@app/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { FavouriteDoctor } from '../models/favourite_doctor.entity';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ManageMedicalReportRepository } from './manage_medical_record.repository';
import { Types } from 'mongoose';
import { PatientRepository } from '../patients.repository';

@Injectable()
export class ManageMedicalRecordService {
    constructor(
        private readonly manageMedicalReportRepository: ManageMedicalReportRepository,
        private readonly patientRepository: PatientRepository,
        @Inject(PATIENTS_TO_STAFF_SERVICE)
        private readonly httpService: HttpService
    ) { }
    async getGroupedMedicalRecordsByUserId(userId: string) {
        try {
            // 1. Tìm tất cả hồ sơ bệnh nhân thuộc user
            const patients = await this.patientRepository.find({ patient_account_id: userId });

            if (!patients || patients.length === 0) {
                throw new NotFoundException(`No patients found for account ID: ${userId}`);
            }

            // 2. Lấy danh sách patientId để truy vấn medical records
            const patientIds = patients.map((p) => p._id);

            const records = await this.manageMedicalReportRepository.findAndSort(
                { patient_id: { $in: patientIds } },
                { sort: { createdAt: -1 } }
            );

            // 3. Gộp record theo từng bệnh nhân
            const result = patients
                .map((patient) => {
                    const medicalRecordsForPatient = records
                        .filter((record) => record.patient_id.toString() === patient._id.toString())
                        .map((record) => ({
                            _id: record._id.toString(),
                            appointment_id: record.appointment_id,
                            doctor_id: record.doctor_id,
                            clinic_id: record.clinic_id,
                            symptoms: record.symptoms,
                            diagnosis: record.diagnosis,
                            next_appoint: record.next_appoint,
                            createdAt: record.createdAt,
                            updatedAt: record.updatedAt,
                        }));

                    return {
                        patient_id: patient._id.toString(),
                        patient_name: patient.fullname,
                        medicalRecords: medicalRecordsForPatient,
                    };
                })
                .filter((entry) => entry.medicalRecords.length > 0); // ✅ lọc bỏ hồ sơ không có lịch sử khám

            return result;
        } catch (error) {
            console.error('Error in getGroupedMedicalRecordsByUserId:', error);
            throw error;
        }
    }

    async getDetailMedicalRecordsBymRId(mRid: string) {
        try {
            const record = await this.manageMedicalReportRepository.findOne({
                _id: new Types.ObjectId(mRid),
            });

            if (!record) {
                throw new NotFoundException(`No medical record found for ID: ${mRid}`);
            }

            const patient = await this.patientRepository.findOne({
                _id: record.patient_id,
            });

            const result =  {
                _id: record._id.toString(),
                patient_id: record.patient_id.toString(),
                patient_name: patient?.fullname || null,
                gender: patient?.gender,
                dOB: patient?.dOB || null,
                bloodGroup: patient?.bloodGroup || null,
                symptoms: record.symptoms,
                diagnosis: record.diagnosis,
                next_appoint: record.next_appoint,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
                doctor_id: record.doctor_id,
                clinic_id: record.clinic_id,
            };

            return result;
        } catch (error) {
            console.error('Error in getDetailMedicalRecordById:', error);
            throw error;
        }
    }

}
