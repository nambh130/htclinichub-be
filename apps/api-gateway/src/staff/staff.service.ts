import { Injectable } from '@nestjs/common';
import {
  CreateDoctorAccountDto,
  CreateEmployeeAccountDto,
  DoctorDegreeDto,
  DoctorSpecializeDto,
  TokenPayload,
} from '@app/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DoctorStepOneDto } from '@app/common/dto/staffs/create-doctor-profile.dto';

@Injectable()
export class StaffService {
  constructor(private readonly httpService: HttpService) {}

  async getDoctorAccountList(page = 1, limit = 10): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get('/staff/doctor/account-list', {
        params: { page, limit },
      }),
    );
    return response.data;
  }

  async getDoctorById(doctorId: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get(`/staff/doctor/${doctorId}`),
    );
    return response.data;
  }

  async createDoctorAccount(
    dto: CreateDoctorAccountDto,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { dto, currentUser };

    const response = await firstValueFrom(
      this.httpService.post('/staff/doctor/create-account', payload),
    );
    return response.data;
  }

  async lockDoctorAccount(
    id: string,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { id, currentUser };

    const response = await firstValueFrom(
      this.httpService.post('/staff/doctor/lock', payload),
    );
    return response.data;
  }

  async unlockDoctorAccount(
    id: string,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { id, currentUser };

    const response = await firstValueFrom(
      this.httpService.post('/staff/doctor/unlock', payload),
    );
    return response.data;
  }

  async getStaffInfoByDoctorId(doctorId: string): Promise<unknown> {
    const payload = { doctorId };

    const response = await firstValueFrom(
      this.httpService.post('/staff/doctor/profile', payload),
    );

    return response.data;
  }

  async createDoctorProfileStepOne(
    staffId: string,
    dto: DoctorStepOneDto,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { staffId, dto, currentUser };

    const response = await firstValueFrom(
      this.httpService.post('/staff/doctor/create-profile/step-one', payload),
    );

    return response.data;
  }

  async addDoctorDegree(
    staffInfoId: string,
    dto: DoctorDegreeDto,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { staffInfoId, dto, currentUser };

    const response = await firstValueFrom(
      this.httpService.post(`/staff/doctor/add-degree`, payload),
    );

    return response.data;
  }

  async addDoctorSpecialize(
    staffInfoId: string,
    dto: DoctorSpecializeDto,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const payload = { staffInfoId, dto, currentUser };

    const response = await firstValueFrom(
      this.httpService.post(`/staff/doctor/add-specialize`, payload),
    );

    return response.data;
  }

  //Employee services
  async viewEmployeeAccountList(): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get('/staff/employee-account-list'),
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
      this.httpService.post('/staff/create-employee-account', payload),
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
      this.httpService.post('/staff/lock-employee-account', payload),
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
      this.httpService.post('/staff/unlock-employee-account', payload),
    );
    return response.data;
  }
}
