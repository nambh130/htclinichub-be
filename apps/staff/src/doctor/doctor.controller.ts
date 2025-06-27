import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { ActorType, CreateDoctorAccountDto } from '@app/common';
import { CreateDoctorProfileDto } from '@app/common/dto/staffs/create-doctor-profile.dto';

@Controller('staff')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get('doctor-account-list')
  viewDoctorAccountList() {
    return this.doctorService.viewDoctorAccountList();
  }

  @Get('doctor-by-clinic/:clinicId')
  getDoctorByClinic(@Param('clinicId') clinicId: string) {
    return this.doctorService.getDoctorByClinic(clinicId);
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
  //khanh
  @Get('doctor-account-byId/:id')
  viewDoctorAccountById(@Param('id') id: string) {
    return this.doctorService.getDoctorAccountById(id);
  }
}
