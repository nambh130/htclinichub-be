import { PATIENT_SERVICE, TokenPayload } from '@app/common';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { DoctorService } from '../../staff/doctor/doctor.service';
import { EmployeeService } from '../../staff/employee/employee.service';

@Injectable()
export class ManageMedicalRecordService {
  constructor(
    @Inject(PATIENT_SERVICE) private readonly httpService: HttpService,
    // private readonly clinicService: ClinicService,
    private readonly doctorService: DoctorService,
    private readonly employeeService: EmployeeService,
  ) {}

  async getMedicalRecordsByUserId(userId: string, currentUser: TokenPayload) {
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
            const doctorDetails =
              await this.doctorService.getDoctorDetailsById(doctorId);
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
      console.error(
        'Error retrieving medical records:',
        error?.response?.data || error,
      );
      throw error;
    }
  }

  async getDetailMedicalRecordsBymRId(mRid: string) {
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
        const doctorDetails = await this.doctorService.getDoctorDetailsById(
          record.doctor_id,
        );
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
        appointmentId: record.appointment_id,
        bloodGroup: record.bloodGroup,
        symptoms: record.symptoms,
        treatmentDirection: record.treatmentDirection,
        icd: {
          code: record.icd?.code,
          name: record.icd?.name,
        },
        diagnosis: record.diagnosis,
        next_appoint: record.next_appoint,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        doctorInfo,
      };
    } catch (error) {
      console.error(
        'Error retrieving medical records:',
        error?.response?.data || error,
      );
      throw error;
    }
  }

  async createMedicalRecord(data: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`/manage-medical-record/create-medical-record`, {
          ...data,
        }),
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error creating medical record:',
        error?.response?.data || error,
      );
      throw error;
    }
  }

  async updateMedicalRecord(mRid: string, payload: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(
          `/manage-medical-record/update-medical-record/${mRid}`,
          payload,
        ),
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error updating medical record:',
        error?.response?.data || error,
      );
      throw error;
    }
  }
  async getMedicalRecordsByAppointmentId(appointmentId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `/manage-medical-record/get-medical-record-by-appointmentId/${appointmentId}`,
        ),
      );
      return response.data;
    } catch (error) {
      console.error(
        'Error retrieving medical records:',
        error?.response?.data || error,
      );
      throw error;
    }
  }

  async getDetailMedicalRecordsQRBymRId(mRid: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `/manage-medical-record/get-detail-medical-record-qr/${mRid}`,
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
        const doctorDetails = await this.doctorService.getDoctorDetailsById(
          record.doctor_id,
        );
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
        appointmentId: record.appointment_id,
        bloodGroup: record.bloodGroup,
        symptoms: record.symptoms,
        treatmentDirection: record.treatmentDirection,
        icd: {
          code: record.icd?.code,
          name: record.icd?.name,
        },
        diagnosis: record.diagnosis,
        next_appoint: record.next_appoint,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        doctorInfo,
      };
    } catch (error) {
      console.error(
        'Error retrieving medical records:',
        error?.response?.data || error,
      );
      throw error;
    }
  }
}
