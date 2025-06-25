import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import {
  CreateDoctorAccountDto,
  DoctorDegreeDto,
  DoctorSpecializeDto,
  TokenPayload,
} from '@app/common';
import { DoctorStepOneDto } from '@app/common/dto/staffs/create-doctor-profile.dto';

@Controller('staff/doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get('account-list')
  getDoctorAccountList(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.doctorService.getDoctorAccountList(+page, +limit);
  }

  @Get(':id')
  getDoctorById(@Param('id') doctorId: string) {
    return this.doctorService.getDoctorById(doctorId);
  }

  @Post('create-account')
  createDoctorAccount(
    @Body()
    payload: {
      dto: CreateDoctorAccountDto;
      currentUser: TokenPayload;
    },
  ) {
    return this.doctorService.createDoctorAccount(
      payload.dto,
      payload.currentUser,
    );
  }

  @Post('lock')
  lockDoctorAccount(
    @Body()
    payload: {
      id: string;
      currentUser: TokenPayload;
    },
  ) {
    return this.doctorService.lockDoctorAccount(
      payload.id,
      payload.currentUser,
    );
  }

  @Post('unlock')
  unlockDoctorAccount(
    @Body()
    payload: {
      id: string;
      currentUser: TokenPayload;
    },
  ) {
    return this.doctorService.unlockDoctorAccount(
      payload.id,
      payload.currentUser,
    );
  }

  @Post('profile')
  getStaffInfoByDoctorId(@Body() payload: { doctorId: string }) {
    return this.doctorService.getStaffInfoByDoctorId(payload.doctorId);
  }

  @Post('create-profile/step-one')
  createDoctorProfileStepOne(
    @Body()
    payload: {
      staffId: string;
      dto: DoctorStepOneDto;
      currentUser: TokenPayload;
    },
  ) {
    return this.doctorService.createDoctorProfileStepOne(
      payload.staffId,
      payload.dto,
      payload.currentUser,
    );
  }

  @Post('add-degree')
  addDoctorDegree(
    @Body()
    payload: {
      staffInfoId: string;
      dto: DoctorDegreeDto;
      currentUser: TokenPayload;
    },
  ) {
    const { staffInfoId, dto, currentUser } = payload;
    return this.doctorService.addDoctorDegree(staffInfoId, dto, currentUser);
  }

  @Post('add-specialize')
  addDoctorSpecialize(
    @Body()
    payload: {
      staffInfoId: string;
      dto: DoctorSpecializeDto;
      currentUser: TokenPayload;
    },
  ) {
    const { staffInfoId, dto, currentUser } = payload;
    return this.doctorService.addDoctorDegree(staffInfoId, dto, currentUser);
  }
}
