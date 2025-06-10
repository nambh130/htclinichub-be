import { Controller } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { ActorType, CreateDoctorAccountDto } from '@app/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @MessagePattern('view-doctor-account-list')
  viewDoctorAccountList() {
    return this.doctorService.viewDoctorAccountList();
  }

  @MessagePattern('create-doctor-account')
  createDoctorAccount(
    @Payload()
    payload: {
      dto: CreateDoctorAccountDto;
      user: { id: string; type: ActorType };
    },
  ) {
    return this.doctorService.createDoctorAccount(payload.dto, payload.user);
  }

  @MessagePattern('lock-doctor-account')
  async lockDoctorAccount(
    @Payload()
    data: {
      doctorId: string;
      user: { id: string; type: ActorType };
    },
  ) {
    return this.doctorService.lockDoctorAccount(data.doctorId, data.user);
  }
}
