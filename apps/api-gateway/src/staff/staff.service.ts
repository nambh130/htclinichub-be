import { Injectable } from '@nestjs/common';
import {
  CreateDoctorAccountDto,
  CreateEmployeeAccountDto,
  UserDocument,
} from '@app/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class StaffService {
  constructor(private readonly httpService: HttpService) {}

  async viewDoctorAccountList(): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get('/staff/doctor-account-list'),
    );
    return response.data;
  }

  async createDoctorAccount(
    dto: CreateDoctorAccountDto,
    user: UserDocument,
  ): Promise<unknown> {
    const payload = {
      dto,
      user: {
        id: user._id,
        type: user.type,
      },
    };

    const response = await firstValueFrom(
      this.httpService.post('/staff/create-doctor-account', payload),
    );
    return response.data;
  }

  async lockDoctorAccount(id: string, user: UserDocument): Promise<unknown> {
    const payload = {
      id,
      user: {
        id: user._id,
        type: user.type,
      },
    };

    const response = await firstValueFrom(
      this.httpService.post('/staff/lock-doctor-account', payload),
    );
    return response.data;
  }

  async unlockDoctorAccount(id: string, user: UserDocument): Promise<unknown> {
    const payload = {
      id,
      user: {
        id: user._id,
        type: user.type,
      },
    };

    const response = await firstValueFrom(
      this.httpService.post('/staff/unlock-doctor-account', payload),
    );
    return response.data;
  }

  async createDoctorProfile(
    dto: CreateDoctorAccountDto,
    user: UserDocument,
  ): Promise<unknown> {
    const payload = {
      dto,
      user: {
        id: user._id,
        type: user.type,
      },
    };

    const response = await firstValueFrom(
      this.httpService.post('/staff/create-doctor-account', payload),
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
    user: UserDocument,
  ): Promise<unknown> {
    const payload = {
      dto,
      user: {
        id: user._id,
        type: user.type,
      },
    };

    const response = await firstValueFrom(
      this.httpService.post('/staff/create-employee-account', payload),
    );
    return response.data;
  }

  async lockEmployeeAccount(id: string, user: UserDocument): Promise<unknown> {
    const payload = {
      id,
      user: {
        id: user._id,
        type: user.type,
      },
    };

    const response = await firstValueFrom(
      this.httpService.post('/staff/lock-employee-account', payload),
    );
    return response.data;
  }

  async unlockEmployeeAccount(
    id: string,
    user: UserDocument,
  ): Promise<unknown> {
    const payload = {
      id,
      user: {
        id: user._id,
        type: user.type,
      },
    };

    const response = await firstValueFrom(
      this.httpService.post('/staff/unlock-employee-account', payload),
    );
    return response.data;
  }


  //khanh: get doctor account by id
  async getDoctorAccountById(id: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.get(`/staff/doctor-account-byId/${id}`),
    );
    return response.data;
  }
}
