import { Controller, Get, Post, Body } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { ActorType, CreateDoctorAccountDto } from '@app/common';
import { CreateDoctorProfileDto } from '@app/common/dto/staffs/create-doctor-profile.dto';
import { EventPattern } from '@nestjs/microservices';
import { ClinicUserCreated } from '@app/common/events/auth/clinic-user-created.event';
import { ActorEnum } from '@app/common/enum/actor-type';

@Controller('staff')
export class DoctorEventController {
  constructor(private readonly doctorService: DoctorService) { }

  @Get('doctor-account-list')
  viewDoctorAccountList() {
    return this.doctorService.viewDoctorAccountList();
  }

  @Post('create-doctor-account')
  @EventPattern('clinic-user-created')
  createDoctorAccount(
    @Body()
    payload: ClinicUserCreated
  ) {
    if (payload.actorType == ActorEnum.DOCTOR) {
      const { email, clinicId, actorType, id } = payload;
      return this.doctorService.createDoctorAccount(
        {
          email,
          clinic: clinicId,
          //clinic_id: clinicId,
          password: "Abc@123.com"
        },
        {
          id,
          type: actorType as ActorType
        },
      );
    }
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
}

