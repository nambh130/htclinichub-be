import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { AUTH_SERVICE, CreateDoctorAccountDto } from '@app/common';
import { ClientKafka } from '@nestjs/microservices';
import { STAFF_SERVICE } from '@app/common';

@Injectable()
export class StaffService implements OnModuleInit {
  constructor(
    @Inject(STAFF_SERVICE) private readonly staffClient: ClientKafka,
    @Inject(AUTH_SERVICE)
    private readonly authClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.staffClient.subscribeToResponseOf('create-doctor-account');
    this.authClient.subscribeToResponseOf('authenticate');

    await this.authClient.connect();
    await this.staffClient.connect();
  }

  create(dto: CreateDoctorAccountDto) {
    return this.staffClient.send('create-doctor-account', dto);
  }

  findAll() {
    return `This action returns all staff`;
  }

  findOne(id: number) {
    return `This action returns a #${id} staff`;
  }
}
