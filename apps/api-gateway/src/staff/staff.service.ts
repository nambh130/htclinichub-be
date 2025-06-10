import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  CreateDoctorAccountDto,
  safeKafkaCall,
  UserDocument,
} from '@app/common';
import { ClientKafka } from '@nestjs/microservices';
import { STAFF_SERVICE } from '@app/common';

@Injectable()
export class StaffService implements OnModuleInit {
  constructor(
    @Inject(STAFF_SERVICE) private readonly staffClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.staffClient.subscribeToResponseOf('create-doctor-account');
    this.staffClient.subscribeToResponseOf('view-doctor-account-list');
    this.staffClient.subscribeToResponseOf('lock-doctor-account');

    await this.staffClient.connect();
  }

  async viewDoctorAccountList(): Promise<unknown> {
    return await safeKafkaCall(
      this.staffClient.send('view-doctor-account-list', {}),
    );
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

    return await safeKafkaCall(
      this.staffClient.send('create-doctor-account', payload),
    );
  }

  async lockDoctorAccount(
    doctorId: string,
    user: UserDocument,
  ): Promise<unknown> {
    const payload = {
      doctorId,
      user: {
        id: user._id,
        type: user.type,
      },
    };

    return await safeKafkaCall(
      this.staffClient.send('lock-doctor-account', payload),
    );
  }
}
