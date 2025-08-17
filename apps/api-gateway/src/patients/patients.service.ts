import {
  AUTH_SERVICE,
  CreatePatientDto,
  UpdatePatientDto,
  PATIENT_SERVICE,
  TokenPayload,
} from '@app/common';
import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PatientService {
  constructor(
    @Inject(PATIENT_SERVICE) private readonly httpService: HttpService,
  ) {}

  // Patient-related methods
  async createPatient(
    createPatientDto: CreatePatientDto,
    currentUser: TokenPayload,
  ) {
    try {
      const payload = { createPatientDto, currentUser };

      const response = await firstValueFrom(
        this.httpService.post('/patient-service/create-patient', payload),
      );
      const responseData = response.data;

      // ✅ Nếu BE trả về { success: false } thì throw lỗi lên Gateway Controller
      if (!responseData.success) {
        throw new HttpException(
          {
            message: responseData.message || 'Tạo hồ sơ thất bại!',
            statusCode: 400,
          },
          400,
        );
      }

      return responseData.data;
    } catch (error) {
      console.error('Error creating patient:', error);

      const message =
        error?.response?.data?.message || error.message || 'Unknown error';
      const status = error?.response?.data?.statusCode || 500;

      throw new HttpException(
        {
          message,
          statusCode: status,
        },
        status,
      );
    }
  }

  async updatePatient(
    patient_account_id: string,
    updatePatientDto: UpdatePatientDto,
    currentUser: TokenPayload,
  ) {
    try {
      const payload = {
        updatePatientDto,
        currentUser,
      };

      const result = await firstValueFrom(
        this.httpService.put(
          `/patient-service/update-patient/${patient_account_id}`,
          payload,
        ),
      );

      const responseData = result.data;

      // ✅ Nếu BE trả về { success: false } thì throw lỗi lên Gateway Controller
      if (!responseData.success) {
        throw new HttpException(
          {
            message: responseData.message || 'Tạo hồ sơ thất bại!',
            statusCode: 400,
          },
          400,
        );
      }

      return responseData.data;
    } catch (error) {
      console.error('Error creating patient:', error);

      const message =
        error?.response?.data?.message || error.message || 'Unknown error';
      const status = error?.response?.data?.statusCode || 500;

      throw new HttpException(
        {
          message,
          statusCode: status,
        },
        status,
      );
    }
  }

  async deletePatient(id: string, currentUser: TokenPayload) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`/patient-service/delete-patient/${id}`),
      );

      return response.data;
    } catch (error) {
      console.error(
        'Error deleting patient:',
        error?.response?.data || error.message,
      );
    }
  }

  async getPatientById(id: string, currentUser: TokenPayload) {
    try {
      const result = await firstValueFrom(
        this.httpService.get(`/patient-service/get-patient-by-id/${id}`),
      );
      return result.data;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientOffline(clinicId: string, currentUser: TokenPayload) {
    try {
      const result = await firstValueFrom(
        this.httpService.get(
          `/patient-service/get-patient-offline/${clinicId}`,
        ),
      );
      return result.data;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getAllPatientProfileOfClinic(clinicId: string, currentUser: TokenPayload) {
    try {
      const result = await firstValueFrom(
        this.httpService.get(
          `/patient-service/get-patient-clinic/${clinicId}`,
        ),
      );
      return result.data;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientByFullName(fullName: string, currentUser: TokenPayload) {
    try {
      const result = await firstValueFrom(
        this.httpService.get(
          `/patient-service/get-patient-by-fullName/${fullName}`,
        ),
      );
      return result.data;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientByPhoneNumber(
    phoneNumber: string,
    currentUser: TokenPayload,
  ) {
    try {
      const result = await firstValueFrom(
        this.httpService.get(
          `/patient-service/get-patient-by-phone/${phoneNumber}`,
        ),
      );
      return result.data;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientByCid(cid: string, currentUser: TokenPayload) {
    try {
      const result = await firstValueFrom(
        this.httpService.get(`/patient-service/get-patient-by-cid/${cid}`),
      );
      return result.data;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientByHid(hid: string, currentUser: TokenPayload) {
    try {
      const result = await firstValueFrom(
        this.httpService.get(`/patient-service/get-patient-by-hid/${hid}`),
      );
      return result.data;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getAllPatients(currentUser: TokenPayload) {
    try {
      const result = await firstValueFrom(
        this.httpService.get('/patient-service/get-all-patients'),
      );
      return result.data;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  //khanhlq
  async assignToClinic(currentUser: TokenPayload, clinicId: string) {
    try {
      const payload = { userId: currentUser.userId };
      const result = await firstValueFrom(
        this.httpService.post(
          `/patient-service/assign-to-clinic/${clinicId}`,
          payload,
        ),
      );
      return result.data;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientClinics(id: string) {
    try {
      const result = await firstValueFrom(
        this.httpService.get(`/patient-service/get-patient-clinics/${id}`),
      );
      return result.data;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientAccount(id: string) {
    try {
      const result = await firstValueFrom(
        this.httpService.get(`/patient-service/get-patient-account/${id}`),
      );
      return result.data;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }
  async getPatientAccounts() {
    try {
      const result = await firstValueFrom(
        this.httpService.get(`/patient-service/get-patient-accounts`),
      );
      return result.data;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientByAccountId(id: string) {
    try {
      const result = await firstValueFrom(
        this.httpService.get(
          `/patient-service/get-patient-by-account-id/${id}`,
        ),
      );
      return result.data;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getPatientProfileByAccountId(
    account_id: string,
    currentUser: TokenPayload,
  ) {
    try {
      const result = await firstValueFrom(
        this.httpService.get(
          `/patient-service/get-patientProfile-by-account_id/${account_id}`,
        ),
      );
      return result.data;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async checkProfileByAccountId(accountId: string) {
    try {
      const result = await firstValueFrom(
        this.httpService.get(`/patient-service/check-profile/${accountId}`),
      );
      return result.data;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  async getAppointmentsByClinicId(
    clinicId: string,
    currentUser: TokenPayload,
    searchParams?: {
      doctorName?: string;
      patientName?: string;
      doctorId?: string;
    },
  ) {
    try {
      const params: any = { clinic_id: clinicId };

      if (searchParams?.doctorName) {
        params.doctor_name = searchParams.doctorName;
      }
      if (searchParams?.patientName) {
        params.patient_name = searchParams.patientName;
      }
      if (searchParams?.doctorId) {
        params.doctor_id = searchParams.doctorId;
      }

      const result = await firstValueFrom(
        this.httpService.get(`/patient-service/appointment/clinic-id`, {
          params,
        }),
      );
      return result.data;
    } catch (error) {
      console.error('Error retrieving appointments by clinic id:', error);
      throw error;
    }
  }
}
