import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  CreateEmployeeAccountDto,
  EmployeeDegreeDto,
  EmployeeSpecializeDto,
  EmployeeProfileDto,
  STAFF_SERVICE,
  StaffDetails,
  TokenPayload,
  Media,
  UpdateDegreeDto,
  UpdateSpecializeDto,
  UpdateProfileDto,
} from '@app/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { MediaService } from '@media-gw/media.service';
import { AxiosError } from 'axios';

@Injectable()
export class EmployeeService {
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
  // EMPLOYEE ACCOUNT MANAGEMENT
  // ============================================================================

  async getEmployeeAccountList(page = 1, limit = 10): Promise<unknown> {
    const response = await firstValueFrom(
      this.staffService.get('/staff/employee/account-list', {
        params: { page, limit },
      }),
    );
    return response.data;
  }

  async getEmployeeListWithProfile(
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
        this.staffService.get(`/staff/employee/account-list-with-profile`, {
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

  async getEmployeeByClinic(clinicId: string): Promise<unknown> {
    console.log(
      'Calling staff service getEmployeeByClinic with clinicId:',
      clinicId,
    );
    const response = await firstValueFrom(
      this.staffService.get(`/staff/employee/employee-by-clinic/${clinicId}`),
    );
    return response.data;
  }

  async getEmployeeById(employeeId: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.staffService.get(`/staff/employee/${employeeId}`),
    );
    return response.data;
  }

  async getEmployeeDetailsById(employeeId: string): Promise<StaffDetails> {
    const response = await firstValueFrom(
      this.staffService.get(`/staff/employee/details/${employeeId}`),
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

  async createEmployeeAccount(
    dto: CreateEmployeeAccountDto,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { dto, currentUser };

    const response = await firstValueFrom(
      this.staffService.post('/staff/employee/create-account', payload),
    );
    return response.data;
  }

  async lockEmployeeAccount(
    id: string,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { id, currentUser };

    const response = await firstValueFrom(
      this.staffService.post('/staff/employee/lock', payload),
    );
    return response.data;
  }

  async unlockEmployeeAccount(
    id: string,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { id, currentUser };

    const response = await firstValueFrom(
      this.staffService.post('/staff/employee/unlock', payload),
    );
    return response.data;
  }

  // ============================================================================
  // EMPLOYEE PROFILE MANAGEMENT
  // ============================================================================

  async getStaffInfoByEmployeeId(employeeId: string): Promise<unknown> {
    const payload = { employeeId };

    const response = await firstValueFrom(
      this.staffService.post('/staff/employee/profile', payload),
    );

    return response.data;
  }

  async createEmployeeProfile(
    staffId: string,
    dto: EmployeeProfileDto,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { staffId, dto, currentUser };

    const response = await firstValueFrom(
      this.staffService.post('/staff/employee/create-profile', payload),
    );

    return response.data;
  }

  async updateEmployeeProfile(
    employeeId: string,
    dto: UpdateProfileDto,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    try {
      const payload = { employeeId, dto, currentUser };

      const response = await firstValueFrom(
        this.staffService.post('/staff/employee/update-profile', payload),
      );

      return response.data;
    } catch (error) {
      if (this.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.data) {
          throw new HttpException(
            (axiosError.response.data as Record<string, unknown>).message ||
              'Failed to update employee profile',
            axiosError.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
      throw new HttpException(
        'Failed to update employee profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ============================================================================
  // EMPLOYEE DEGREES MANAGEMENT
  // ============================================================================

  async getDegreesByEmployeeId(employeeId: string): Promise<unknown[]> {
    const payload = { employeeId };

    const response = await firstValueFrom(
      this.staffService.post<unknown[]>('/staff/employee/get-degrees', payload),
    );

    return response.data;
  }

  async addEmployeeDegree(
    employeeId: string,
    dto: EmployeeDegreeDto,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { employeeId, dto, currentUser };

    const response = await firstValueFrom(
      this.staffService.post(`/staff/employee/add-degree`, payload),
    );

    return response.data;
  }

  async updateEmployeeDegree(
    employeeId: string,
    degreeId: string,
    dto: UpdateDegreeDto,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { employeeId, degreeId, dto, currentUser };

    const response = await firstValueFrom(
      this.staffService.post(`/staff/employee/update-degree`, payload),
    );

    return response.data;
  }

  async deleteEmployeeDegree(
    employeeId: string,
    degreeId: string,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { employeeId, degreeId, currentUser };

    const response = await firstValueFrom(
      this.staffService.post(`/staff/employee/delete-degree`, payload),
    );

    return response.data;
  }

  // ============================================================================
  // EMPLOYEE SPECIALIZATIONS MANAGEMENT
  // ============================================================================

  async getSpecializesByEmployeeId(employeeId: string): Promise<unknown[]> {
    const payload = { employeeId };

    const response = await firstValueFrom(
      this.staffService.post<unknown[]>(
        '/staff/employee/get-specializes',
        payload,
      ),
    );

    return response.data;
  }

  async addEmployeeSpecialize(
    employeeId: string,
    dto: EmployeeSpecializeDto,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { employeeId, dto, currentUser };

    const response = await firstValueFrom(
      this.staffService.post(`/staff/employee/add-specialize`, payload),
    );

    return response.data;
  }

  async updateEmployeeSpecialize(
    employeeId: string,
    specializeId: string,
    dto: UpdateSpecializeDto,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { employeeId, specializeId, dto, currentUser };

    const response = await firstValueFrom(
      this.staffService.post(`/staff/employee/update-specialize`, payload),
    );

    return response.data;
  }

  async deleteEmployeeSpecialize(
    employeeId: string,
    specializeId: string,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { employeeId, specializeId, currentUser };

    const response = await firstValueFrom(
      this.staffService.post(`/staff/employee/delete-specialize`, payload),
    );

    return response.data;
  }

  async getEmployeeAccountById(id: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.staffService.get(`/staff/employee/employee-account-byId/${id}`),
    );
    return response.data;
  }

  // ============================================================================
  // CLINIC ASSIGNMENT
  // ============================================================================

  async assignEmployeeToClinic(
    employeeId: string,
    clinicId: string,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { employeeId, clinicId, currentUser };

    const response = await firstValueFrom(
      this.staffService.post('/staff/employee/assign-clinic', payload),
    );

    return response.data;
  }

  async removeEmployeeFromClinic(
    employeeId: string,
    clinicId: string,
  ): Promise<unknown> {
    const payload = { employeeId, clinicId };

    const response = await firstValueFrom(
      this.staffService.post(`/staff/employee/remove-clinic`, payload),
    );

    return response.data;
  }

  // ============================================================================
  // LEGACY METHOD (for backward compatibility)
  // ============================================================================

  async viewEmployeeAccountList(): Promise<unknown> {
    return this.getEmployeeAccountList();
  }
}
