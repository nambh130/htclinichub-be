import {
  Inject,
  Injectable,
  BadRequestException,
  OnModuleInit,
  NotFoundException,
} from '@nestjs/common';
import {
  AUTH_SERVICE,
  FavouriteDoctorDto,
  PATIENTS_TO_STAFF_SERVICE,
} from '@app/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { FavouriteDoctor } from '../models/favourite_doctor.entity';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Types } from 'mongoose';
import { PatientRepository } from '../patients.repository';
import { MedicalRecord } from '../models/medical_record.schema';
import { MedicalReportRepository } from './manage_medical_record.repository';
import { log } from 'console';

@Injectable()
export class ManageMedicalRecordService {
  constructor(
    private readonly manageMedicalReportRepository: MedicalReportRepository,
    private readonly patientRepository: PatientRepository,
    @Inject(PATIENTS_TO_STAFF_SERVICE)
    private readonly httpService: HttpService,
  ) { }
  async getGroupedMedicalRecordsByUserId(userId: string) {
    try {
      // 1. Tìm tất cả hồ sơ bệnh nhân thuộc user
      const patients = await this.patientRepository.find({
        patient_account_id: userId,
      });

      if (!patients || patients.length === 0) {
        throw new NotFoundException(
          `No patients found for account ID: ${userId}`,
        );
      }

      // 2. Lấy danh sách patientId để truy vấn medical records
      const patientIds = patients.map((p) => p._id);

      const records = await this.manageMedicalReportRepository.findAndSort(
        { patient_id: { $in: patientIds } },
        { sort: { createdAt: -1 } },
      );

      // 3. Gộp record theo từng bệnh nhân
      const result = patients
        .map((patient) => {
          const medicalRecordsForPatient = records
            .filter(
              (record) =>
                record.patient_id.toString() === patient._id.toString(),
            )
            .map((record) => ({
              _id: record._id.toString(),
              appointment_id: record.appointment_id,
              icd: record.icd, // ✅ thêm icd vào
              symptoms: record.symptoms,
              diagnosis: record.diagnosis,
              treatmentDirection: record.treatmentDirection, // ✅ thêm treatmentDirection
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
        .filter((entry) => entry.medicalRecords.length > 0); // lọc bệnh nhân không có record

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

      const result = {
        _id: record._id.toString(),
        patient_id: record.patient_id.toString(),
        appointment_id: record.appointment_id,
        patient_name: patient?.fullname || null,
        gender: patient?.gender,
        dOB: patient?.dOB || null,
        bloodGroup: patient?.bloodGroup || null,
        symptoms: record.symptoms,
        diagnosis: record.diagnosis,
        next_appoint: record.next_appoint,
        icd: {
          code: record.icd?.code,
          name: record.icd?.name,
        },
        treatmentDirection: record.treatmentDirection,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      };

      return result;
    } catch (error) {
      console.error('Error in getDetailMedicalRecordById:', error);
      throw error;
    }
  }

  async createMedicalRecord(data: {
    patient_id: string;
    appointment_id: string;
  }) {
    try {
      const created = await this.manageMedicalReportRepository.create({
        patient_id: new Types.ObjectId(data.patient_id),
        appointment_id: data.appointment_id,
        icd: null,
        symptoms: '',
        diagnosis: '',
        treatmentDirection: '',
        next_appoint: '',
      });
      console.log('Medical record created:', created);
      return created;
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw new BadRequestException('Failed to create medical record');
    }
  }

  async updateMedicalRecord(mRid: string, payload: any) {
    try {
      const updated = await this.manageMedicalReportRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(mRid) },
        { $set: payload },
      );
      return updated;
    } catch (error) {
      throw new BadRequestException('Failed to update medical record');
    }
  }

  async getMedicalRecordsByAppointmentId(appointmentId: string): Promise<any> {
    try {
      const medicalRecords = await this.manageMedicalReportRepository.findOne({
        appointment_id: appointmentId,
      });
      if (!medicalRecords) {
        throw new NotFoundException(
          `No medical records found for appointment ID: ${appointmentId}`,
        );
      }
      return medicalRecords;
    } catch (error) {
      console.error(
        'Error retrieving medical records by appointment ID:',
        error?.response?.data || error,
      );
      throw error;
    }
  }
}
