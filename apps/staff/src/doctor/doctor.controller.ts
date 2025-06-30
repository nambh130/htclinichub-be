import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import {
  CreateDoctorAccountDto,
  DoctorDegreeDto,
  DoctorSpecializeDto,
  TokenPayload,
  UpdateDegreeDto,
  UpdateSpecializeDto,
} from '@app/common';
import {
  DoctorProfileDto,
  UpdateProfileDto,
} from '@app/common/dto/staffs/doctor-profile.dto';

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

  @Get('account-list-with-profile')
  getDoctorListWithProfile(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.doctorService.getDoctorListWithProfile(+page, +limit);
  }

  @Get('details/:id')
  getDoctorDetails(@Param('id') doctorId: string) {
    return this.doctorService.getStaffInfoByDoctorId(doctorId);
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

  @Post('create-profile')
  createDoctorProfile(
    @Body()
    payload: {
      staffId: string;
      dto: DoctorProfileDto;
      currentUser: TokenPayload;
    },
  ) {
    return this.doctorService.createDoctorProfile(
      payload.staffId,
      payload.dto,
      payload.currentUser,
    );
  }

  @Post('update-profile')
  async updateDoctorProfile(
    @Body()
    body: {
      doctorId: string;
      dto: UpdateProfileDto;
      currentUser: TokenPayload;
    },
  ) {
    const { doctorId, dto, currentUser } = body;
    return this.doctorService.updateDoctorProfile(doctorId, dto, currentUser);
  }

  @Post('get-degrees')
  getDegreeList(
    @Body()
    payload: {
      doctorId: string;
    },
  ) {
    const { doctorId } = payload;
    return this.doctorService.getDegreeList(doctorId);
  }

  @Post('add-degree')
  addDoctorDegree(
    @Body()
    payload: {
      doctorId: string;
      dto: DoctorDegreeDto;
      currentUser: TokenPayload;
    },
  ) {
    const { doctorId, dto, currentUser } = payload;
    return this.doctorService.addDoctorDegree(doctorId, dto, currentUser);
  }

  @Post('update-degree')
  updateDoctorDegree(
    @Body()
    payload: {
      doctorId: string;
      degreeId: string;
      dto: UpdateDegreeDto;
      currentUser: TokenPayload;
    },
  ) {
    const { doctorId, degreeId, dto, currentUser } = payload;
    return this.doctorService.updateDoctorDegree(
      doctorId,
      degreeId,
      dto,
      currentUser,
    );
  }

  @Post('delete-degree')
  deleteDoctorDegree(
    @Body()
    payload: {
      doctorId: string;
      degreeId: string;
    },
  ) {
    const { doctorId, degreeId } = payload;
    return this.doctorService.deleteDoctorDegree(doctorId, degreeId);
  }

  @Post('get-specializes')
  getSpecializeList(
    @Body()
    payload: {
      doctorId: string;
    },
  ) {
    const { doctorId } = payload;
    return this.doctorService.getSpecializeList(doctorId);
  }

  @Post('add-specialize')
  addDoctorSpecialize(
    @Body()
    payload: {
      doctorId: string;
      dto: DoctorSpecializeDto;
      currentUser: TokenPayload;
    },
  ) {
    const { doctorId, dto, currentUser } = payload;
    return this.doctorService.addDoctorSpecialize(doctorId, dto, currentUser);
  }

  @Post('update-specialize')
  updateDoctorSpecialize(
    @Body()
    payload: {
      doctorId: string;
      specializeId: string;
      dto: UpdateSpecializeDto;
      currentUser: TokenPayload;
    },
  ) {
    const { doctorId, specializeId, dto, currentUser } = payload;
    return this.doctorService.updateDoctorSpecialize(
      doctorId,
      specializeId,
      dto,
      currentUser,
    );
  }

  @Post('delete-specialize')
  deleteDoctorSpecialize(
    @Body()
    payload: {
      doctorId: string;
      specializeId: string;
    },
  ) {
    const { doctorId, specializeId } = payload;
    return this.doctorService.deleteDoctorSpecialize(doctorId, specializeId);
  }
}
