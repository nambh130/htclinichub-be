import { Inject, Injectable } from '@nestjs/common';
import {
  CreateDoctorAccountDto,
  CreateEmployeeAccountDto,
  DoctorDegreeDto,
  DoctorSpecializeDto,
  STAFF_SERVICE,
  StaffDetails,
  TokenPayload,
  Media,
} from '@app/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DoctorStepOneDto } from '@app/common/dto/staffs/create-doctor-profile.dto';
import { MediaService } from '../media/media.service';

@Injectable()
export class StaffService {
  constructor(
    private readonly mediaService: MediaService,
    @Inject(STAFF_SERVICE) private readonly httpService: HttpService,
  ) {}

  async getDoctorAccountList(page = 1, limit = 10): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get('/staff/doctor/account-list', {
        params: { page, limit },
      }),
    );
    return response.data;
  }

  async getDoctorByClinic(clinicId: string): Promise<unknown> {
    console.log('Calling staff service getDoctorByClinic with clinicId:', clinicId);
    const response = await firstValueFrom(
      this.httpService.get(`/staff/doctor/doctor-by-clinic/${clinicId}`),
    );
    return response.data;
  }

  async getDoctorById(doctorId: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get(`/staff/doctor/${doctorId}`),
    );
    return response.data;
  }

  async getDoctorDetailsById(doctorId: string): Promise<StaffDetails> {
    const response = await firstValueFrom(
      this.httpService.get(`/staff/doctor/details/${doctorId}`),
    );

    const result = response.data as StaffDetails;
    const staffInfo = result?.account?.staffInfo;

    if (staffInfo) {
      staffInfo.profile_img = (await this.mediaService.getFileById(
        staffInfo.profile_img_id,
      )) as Media | null;

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

  async getDegreesByStaffInfoId(staffInfoId: string): Promise<unknown[]> {
    const payload = { staffInfoId };

    const response = await firstValueFrom(
      this.httpService.post<unknown[]>('/staff/doctor/get-degrees', payload),
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

  async getSpecializesByStaffInfoId(staffInfoId: string): Promise<unknown[]> {
    const payload = { staffInfoId };

    const response = await firstValueFrom(
      this.httpService.post<unknown[]>(
        '/staff/doctor/get-specializes',
        payload,
      ),
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


  //khanh: get doctor account by id
  async getDoctorAccountById(id: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get(`/staff/doctor/doctor-account-byId/${id}`),
    );
    return response.data;
  }

  
}
