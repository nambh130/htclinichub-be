import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  CreateDoctorAccountDto,
  CreateEmployeeAccountDto,
  DoctorDegreeDto,
  DoctorSpecializeDto,
  STAFF_SERVICE,
  StaffDetails,
  TokenPayload,
  Media,
  UpdateDegreeDto,
  UpdateSpecializeDto,
} from '@app/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  DoctorProfileDto,
  UpdateProfileDto,
} from '@app/common/dto/staffs/doctor-profile.dto';
import { MediaService } from '../media/media.service';
import { IDoctorClinicLink } from './interfaces/staff.interface';
import { AxiosError } from 'axios';
import FormData from 'form-data';
import { ImportMedicineDto, UpdateMedicineDto } from '@app/common/dto/staffs/medicine';

@Injectable()
export class StaffService {
  constructor(
    private readonly mediaService: MediaService,
    @Inject(STAFF_SERVICE) private readonly httpService: HttpService,
    @Inject(STAFF_SERVICE) private readonly staffService: HttpService,
  ) { }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private isAxiosError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'isAxiosError' in error &&
      (error as AxiosError).isAxiosError === true
    );
  }

  // ============================================================================
  // DOCTOR ACCOUNT MANAGEMENT
  // ============================================================================

  async getDoctorAccountList(page = 1, limit = 10): Promise<unknown> {
    const response = await firstValueFrom(
      this.staffService.get('/staff/doctor/account-list', {
        params: { page, limit },
      }),
    );
    return response.data;
  }

  async getDoctorListWithProfile(page = 1, limit = 10): Promise<unknown> {
    try {
      const response = await firstValueFrom(
        this.staffService.get(`/staff/doctor/account-list-with-profile`, {
          params: { page, limit },
        }),
      );
      return response.data;
    } catch (error) {
      if (this.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
          throw new HttpException(
            (axiosError.response.data as Record<string, unknown>).message ||
            'Service error',
            axiosError.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
      throw error;
    }
  }

  async getDoctorByClinic(clinicId: string): Promise<unknown> {
    console.log(
      'Calling staff service getDoctorByClinic with clinicId:',
      clinicId,
    );
    const response = await firstValueFrom(
      this.staffService.get(`/staff/doctor/doctor-by-clinic/${clinicId}`),
    );
    return response.data;
  }

  async getDoctorById(doctorId: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.staffService.get(`/staff/doctor/${doctorId}`),
    );
    return response.data;
  }

  async getDoctorDetailsById(doctorId: string): Promise<StaffDetails> {
    console.log('[DEBUG] doctorId truyền vào:', doctorId);

    const response = await firstValueFrom(
      this.staffService.get(`/staff/doctor/details/${doctorId}`),
    );

    const result = response.data as StaffDetails;
    const staffInfo = result?.account?.staffInfo;

    if (staffInfo) {
      staffInfo.profile_img = staffInfo.profile_img_id
        ? ((await this.mediaService.getFileById(
          staffInfo.profile_img_id,
        )) as Media | null)
        : null;

      for (const degree of staffInfo.degrees ?? []) {
        degree.image = degree.image_id
          ? ((await this.mediaService.getFileById(
            degree.image_id,
          )) as Media | null)
          : null;
      }

      for (const specialize of staffInfo.specializes ?? []) {
        specialize.image = specialize.image_id
          ? ((await this.mediaService.getFileById(
            specialize.image_id,
          )) as Media | null)
          : null;
      }
    }

    return result;
  }

  async createDoctorAccount(
    dto: CreateDoctorAccountDto,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { dto, currentUser };

    const response = await firstValueFrom(
      this.staffService.post('/staff/doctor/create-account', payload),
    );
    return response.data;
  }

  async getClinicIdsByDoctor(
    dto: { userId: string },
  ): Promise<IDoctorClinicLink[]> {
    const response = await firstValueFrom(
      this.httpService.get<IDoctorClinicLink[]>(`/staff/doctor/clinic-by-doctor/${dto.userId}`),
    );

    const clinicByDoctors = response.data;

    if (!clinicByDoctors) {
      throw new Error("Something has gone wrong!");
    }

    return clinicByDoctors;
  }

  async lockDoctorAccount(
    id: string,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { id, currentUser };

    const response = await firstValueFrom(
      this.staffService.post('/staff/doctor/lock', payload),
    );
    return response.data;
  }

  async unlockDoctorAccount(
    id: string,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { id, currentUser };

    const response = await firstValueFrom(
      this.staffService.post('/staff/doctor/unlock', payload),
    );
    return response.data;
  }

  // ============================================================================
  // DOCTOR PROFILE MANAGEMENT
  // ============================================================================

  async getStaffInfoByDoctorId(doctorId: string): Promise<unknown> {
    const payload = { doctorId };

    const response = await firstValueFrom(
      this.staffService.post('/staff/doctor/profile', payload),
    );

    return response.data;
  }

  async createDoctorProfile(
    staffId: string,
    dto: DoctorProfileDto,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { staffId, dto, currentUser };

    const response = await firstValueFrom(
      this.staffService.post('/staff/doctor/create-profile', payload),
    );

    return response.data;
  }

  async updateDoctorProfile(
    doctorId: string,
    dto: UpdateProfileDto,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    try {
      const payload = { doctorId, dto, currentUser };

      const response = await firstValueFrom(
        this.staffService.post('/staff/doctor/update-profile', payload),
      );

      return response.data;
    } catch (error) {
      if (this.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
          throw new HttpException(
            (axiosError.response.data as Record<string, unknown>).message ||
            'Failed to update doctor profile',
            axiosError.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
      throw new HttpException(
        'Failed to update doctor profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ============================================================================
  // DOCTOR DEGREES MANAGEMENT
  // ============================================================================

  async getDegreesByDoctorId(doctorId: string): Promise<unknown[]> {
    const payload = { doctorId };

    const response = await firstValueFrom(
      this.staffService.post<unknown[]>('/staff/doctor/get-degrees', payload),
    );

    return response.data;
  }

  async addDoctorDegree(
    doctorId: string,
    dto: DoctorDegreeDto,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { doctorId, dto, currentUser };

    const response = await firstValueFrom(
      this.staffService.post(`/staff/doctor/add-degree`, payload),
    );

    return response.data;
  }

  async updateDoctorDegree(
    doctorId: string,
    degreeId: string,
    dto: UpdateDegreeDto,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { doctorId, degreeId, dto, currentUser };

    const response = await firstValueFrom(
      this.staffService.post(`/staff/doctor/update-degree`, payload),
    );

    return response.data;
  }

  async deleteDoctorDegree(
    doctorId: string,
    degreeId: string,
  ): Promise<unknown> {
    const payload = { doctorId, degreeId };

    const response = await firstValueFrom(
      this.staffService.post(`/staff/doctor/delete-degree`, payload),
    );

    return response.data;
  }

  // ============================================================================
  // DOCTOR SPECIALIZATIONS MANAGEMENT
  // ============================================================================

  async getSpecializesByDoctorId(doctorId: string): Promise<unknown[]> {
    const payload = { doctorId };

    const response = await firstValueFrom(
      this.staffService.post<unknown[]>(
        '/staff/doctor/get-specializes',
        payload,
      ),
    );

    return response.data;
  }

  async addDoctorSpecialize(
    doctorId: string,
    dto: DoctorSpecializeDto,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { doctorId, dto, currentUser };

    const response = await firstValueFrom(
      this.staffService.post(`/staff/doctor/add-specialize`, payload),
    );

    return response.data;
  }

  async updateDoctorSpecialize(
    doctorId: string,
    specializeId: string,
    dto: UpdateSpecializeDto,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { doctorId, specializeId, dto, currentUser };

    const response = await firstValueFrom(
      this.staffService.post(`/staff/doctor/update-specialize`, payload),
    );

    return response.data;
  }

  async deleteDoctorSpecialize(
    doctorId: string,
    specializeId: string,
  ): Promise<unknown> {
    const payload = { doctorId, specializeId };

    const response = await firstValueFrom(
      this.staffService.post(`/staff/doctor/delete-specialize`, payload),
    );

    return response.data;
  }

  // ============================================================================
  // EMPLOYEE MANAGEMENT
  // ============================================================================

  async viewEmployeeAccountList(): Promise<unknown> {
    const response = await firstValueFrom(
      this.staffService.get('/staff/employee-account-list'),
    );
    return response.data;
  }

  async createEmployeeAccount(
    dto: CreateEmployeeAccountDto,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = {
      dto,
      currentUser,
    };

    const response = await firstValueFrom(
      this.staffService.post('/staff/create-employee-account', payload),
    );
    return response.data;
  }

  async lockEmployeeAccount(
    id: string,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = {
      id,
      currentUser,
    };

    const response = await firstValueFrom(
      this.staffService.post('/staff/lock-employee-account', payload),
    );
    return response.data;
  }

  async unlockEmployeeAccount(
    id: string,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = {
      id,
      currentUser,
    };

    const response = await firstValueFrom(
      this.staffService.post('/staff/unlock-employee-account', payload),
    );
    return response.data;
  }

  //khanh: get doctor account by id
  async getDoctorAccountById(id: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.staffService.get(`/staff/doctor/doctor-account-byId/${id}`),
    );
    return response.data;
  }

  async importMedicineCsvHttp(file: Express.Multer.File, clinicId: string) {
    const form = new FormData();
    form.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const response = await firstValueFrom(
      this.staffService.post(`medicine/import-csv-to-medicine-data/${clinicId}`, form, {
        headers: form.getHeaders(),
      }
      ))
    return response.data;
  }

  async createMedicine(dto: ImportMedicineDto, clinicId: string, currentUser: TokenPayload) {
    const response = await firstValueFrom(
      this.staffService.post(`medicine/input-data-to-medicine-data/${clinicId}`, {
        dto,
        currentUser,
      }),
    );

    return response.data;
  }

  async getMedicineClinicId(clinicId: string, currentUser: TokenPayload) {
    const response = await firstValueFrom(
      this.staffService.get(`medicine/medicine-data/${clinicId}`));
    return response.data;
  }

  async searchMedicine(
    clinicId: string,
    currentUser: TokenPayload,
    search?: string, // 👈 thêm optional search param
  ) {
    // Build URL có hoặc không có search
    const url = search
      ? `medicine/search-medicine/${clinicId}?search=${encodeURIComponent(search)}`
      : `medicine/search-medicine/${clinicId}`;

    const response = await firstValueFrom(
      this.staffService.get(url),
    );

    return response.data;
  }

  async medicineInfo(clinicId: string, medicineInfo: string) {
    const response = await firstValueFrom(
      this.staffService.get(`medicine/medicine-info/${clinicId}/${medicineInfo}`));
    return response.data;
  }

  async medicineUpdate(clinicId: string, medicineId: string, dto: UpdateMedicineDto, currentUser: TokenPayload) {
    const response = await firstValueFrom(
      this.staffService.put(`medicine/${clinicId}/update-medicine/${medicineId}`, {
        dto,
        currentUser,
      }),
    );

    return response.data;
  }
}
