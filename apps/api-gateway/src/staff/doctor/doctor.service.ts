import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  CreateDoctorAccountDto,
  DoctorDegreeDto,
  DoctorSpecializeDto,
  STAFF_SERVICE,
  StaffDetails,
  TokenPayload,
  Media,
  UpdateDegreeDto,
  UpdateSpecializeDto,
  DoctorProfileDto,
  UpdateProfileDto,
} from '@app/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MediaService } from '@media-gw/media.service';
import { IDoctorClinicLink } from '../interfaces/staff.interface';
import { AxiosError } from 'axios';

@Injectable()
export class DoctorService {
  constructor(
    private readonly mediaService: MediaService,
    @Inject(STAFF_SERVICE) private readonly staffService: HttpService,
  ) {}

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

  async getDoctorListWithProfile(
    page = 1,
    limit = 10,
    search?: string,
    searchField?: 'name' | 'email' | 'phone' | 'all',
    clinicId?: string,
  ): Promise<unknown> {
    try {
      const params: {
        page: number;
        limit: number;
        search?: string;
        searchField?: string;
        clinicId?: string;
      } = { page, limit };
      if (search) params.search = search;
      if (searchField) params.searchField = searchField;
      if (clinicId) params.clinicId = clinicId;
      const response = await firstValueFrom(
        this.staffService.get(`/staff/doctor/account-list-with-profile`, {
          params,
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

  async getClinicIdsByDoctor(userId: string): Promise<IDoctorClinicLink[]> {
    const url = `/staff/doctor/clinic-by-doctor/${userId}`;

    const response = await firstValueFrom(
      this.staffService.get<IDoctorClinicLink[]>(url),
    );
    //console.log('check: ', response.data);

    const clinicByDoctors = response.data;

    if (!clinicByDoctors) {
      throw new Error('Something has gone wrong!');
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
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { doctorId, degreeId, currentUser };

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
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { doctorId, specializeId, currentUser };

    const response = await firstValueFrom(
      this.staffService.post(`/staff/doctor/delete-specialize`, payload),
    );

    return response.data;
  }

  async getDoctorAccountById(id: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.staffService.get(`/staff/doctor/doctor-account-byId/${id}`),
    );
    return response.data;
  }

  // ============================================================================
  // DOCTOR CLINIC ASSIGNMENT
  // ============================================================================

  async assignDoctorToClinic(
    doctorId: string,
    clinicId: string,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { doctorId, clinicId, currentUser };

    const response = await firstValueFrom(
      this.staffService.post('/staff/doctor/assign-clinic', payload),
    );

    return response.data;
  }

  async removeDoctorFromClinic(
    doctorId: string,
    clinicId: string,
  ): Promise<unknown> {
    const payload = { doctorId, clinicId };

    const response = await firstValueFrom(
      this.staffService.post('/staff/doctor/remove-clinic', payload),
    );

    return response.data;
  }
}
