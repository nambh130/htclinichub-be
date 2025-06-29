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

  //khanh 
  @Get('doctor-by-clinic/:clinicId')
  getDoctorByClinic(@Param('clinicId') clinicId: string) {
    return this.doctorService.getDoctorByClinic(clinicId);
  }

  @Get('doctor-account-byId/:id')
  viewDoctorAccountById(@Param('id') id: string) {
    return this.doctorService.getDoctorAccountById(id);
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

  @Get('details/:id')
  getDoctorDetails(@Param('id') doctorId: string) {
    return this.doctorService.getStaffInfoByDoctorId(doctorId);
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

  @Post('get-degrees')
  getDegreeList(
    @Body()
    payload: {
      staffInfoId: string;
    },
  ) {
    const { staffInfoId } = payload;
    return this.doctorService.getDegreeList(staffInfoId);
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
    return this.doctorService.addDoctorSpecialize(
      staffInfoId,
      dto,
      currentUser,
    );
  }

  @Post('get-specializes')
  getSpecializeList(
    @Body()
    payload: {
      staffInfoId: string;
    },
  ) {
    const { staffInfoId } = payload;
    return this.doctorService.getSpecializeList(staffInfoId);
  }
}