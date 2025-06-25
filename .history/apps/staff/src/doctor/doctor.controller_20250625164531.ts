import { Controller, Get, Post, Body } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { ActorType, CreateDoctorAccountDto } from '@app/common';
import { CreateDoctorProfileDto } from '@app/common/dto/staffs/create-doctor-profile.dto';
import { MessagePattern } from '@nestjs/microservices';

@Controller('staff')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) { }

  @Get('doctor-account-list')
  viewDoctorAccountList() {
    return this.doctorService.viewDoctorAccountList();
  }

  @Post('create-doctor-account')
  createDoctorAccount(
    @Body()
    payload: {
      dto: CreateDoctorAccountDto;
      user: { id: string; type: ActorType };
    },
  ) {
    return this.doctorService.createDoctorAccount(payload.dto, payload.user);
  }

  @Post('lock-doctor-account')
  lockDoctorAccount(
    @Body()
    payload: {
      id: string;
      user: { id: string; type: ActorType };
    },
  ) {
    return this.doctorService.lockDoctorAccount(payload.id, payload.user);
  }

  @Post('unlock-doctor-account')
  unlockDoctorAccount(
    @Body()
    payload: {
      id: string;
      user: { id: string; type: ActorType };
    },
  ) {
    return this.doctorService.unlockDoctorAccount(payload.id, payload.user);
  }

  @Post('create-doctor-profile')
  createDoctorProfile(
    @Body()
    payload: {
      dto: CreateDoctorProfileDto;
      user: { id: string; type: ActorType };
    },
  ) {
    return this.doctorService.createDoctorProfile(payload.dto, payload.user);
  }

  @MessagePattern('get-doctors-by-ids')
  async getDoctorsByIds(@Payload() data: { ids: number[] }) {
    console.log('Received IDs Doctor Service:', data.ids);
    // Gọi đến service thật nếu đã có, tạm thời trả mock:
    return this.doctorService.getDoctorsByIds({ ids: data.ids });
  }
}
