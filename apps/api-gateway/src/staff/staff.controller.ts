import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import {
  CreateDoctorAccountDto,
  CreateEmployeeAccountDto,
  CurrentUser,
  DoctorDegreeDto,
  DoctorSpecializeDto,
  JwtAuthGuard,
  TokenPayload,
} from '@app/common';
import { DoctorStepOneDto } from '@app/common/dto/staffs/create-doctor-profile.dto';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  //Doctor-enpoints
  @Get('doctor/account-list')
  @UseGuards(JwtAuthGuard)
  async getDoctorAccountList(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.staffService.getDoctorAccountList(+page, +limit);
  }

  @Get('doctor/:id')
  @UseGuards(JwtAuthGuard)
  async getDoctorById(@Param('id') doctorId: string) {
    return await this.staffService.getDoctorById(doctorId);
  }
 
  
  @Get('doctor-by-clinic/:clinicId')
  @UseGuards(JwtAuthGuard)
  async getDoctorByClinic(@Param('clinicId') clinicId: string) {
    return this.staffService.getDoctorByClinic(clinicId);
  }

  @Get('doctor-details/:id')
  @UseGuards(JwtAuthGuard)
  async getDoctorDetailsById(@Param('id') doctorId: string) {
    return await this.staffService.getDoctorDetailsById(doctorId);
  }

  @Post('doctor/create-account')
  @UseGuards(JwtAuthGuard)
  async createDoctorAccount(
    @Body() dto: CreateDoctorAccountDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.staffService.createDoctorAccount(dto, currentUser);
  }

  @Post('doctor/lock/:id')
  @UseGuards(JwtAuthGuard)
  async lockDoctorAccount(
    @Param('id') id: string,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.staffService.lockDoctorAccount(id, currentUser);
  }

  @Post('doctor/unlock/:id')
  @UseGuards(JwtAuthGuard)
  async unlockDoctorAccount(
    @Param('id') id: string,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.staffService.unlockDoctorAccount(id, currentUser);
  }

  @Get('doctor/:id/profile')
  @UseGuards(JwtAuthGuard)
  async getStaffInfoByDoctorId(@Param('id') doctorId: string) {
    return this.staffService.getStaffInfoByDoctorId(doctorId);
  }

  @Post('doctor/:id/create-profile/step-one')
  @UseGuards(JwtAuthGuard)
  async createDoctorProfileStepOne(
    @Param('id') staffId: string,
    @Body() dto: DoctorStepOneDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.staffService.createDoctorProfileStepOne(
      staffId,
      dto,
      currentUser,
    );
  }

  @Post('doctor/:id/add-degree')
  @UseGuards(JwtAuthGuard)
  addDoctorDegree(
    @Param('id') staffInfoId: string,
    @Body() dto: DoctorDegreeDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.staffService.addDoctorDegree(staffInfoId, dto, currentUser);
  }

  @Get('doctor/:id/degrees')
  @UseGuards(JwtAuthGuard)
  getDegreesByStaffInfoId(@Param('id') staffInfoId: string) {
    return this.staffService.getDegreesByStaffInfoId(staffInfoId);
  }

  @Post('doctor/:id/add-specialize')
  @UseGuards(JwtAuthGuard)
  addDoctorSpecialize(
    @Param('id') staffInfoId: string,
    @Body() dto: DoctorSpecializeDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.staffService.addDoctorSpecialize(staffInfoId, dto, currentUser);
  }

  @Get('doctor/:id/specializes')
  @UseGuards(JwtAuthGuard)
  getSpecializesByStaffInfoId(@Param('id') staffInfoId: string) {
    return this.staffService.getSpecializesByStaffInfoId(staffInfoId);
  }

  //Employee-endpoints
  @Get('employee-account-list')
  @UseGuards(JwtAuthGuard)
  async viewEmployeeAccountList() {
    return this.staffService.viewEmployeeAccountList();
  }

  @Post('create-employee-account')
  @UseGuards(JwtAuthGuard)
  async createEmployeeAccount(
    @Body() dto: CreateEmployeeAccountDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.staffService.createEmployeeAccount(dto, currentUser);
  }

  @Post('lock-employee-account/:id')
  @UseGuards(JwtAuthGuard)
  async lockEmployeeAccount(
    @Param('id') id: string,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.staffService.lockEmployeeAccount(id, currentUser);
  }

  @Post('unlock-employee-account/:id')
  @UseGuards(JwtAuthGuard)
  async unlockEmployeeAccount(
    @Param('id') id: string,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.staffService.unlockEmployeeAccount(id, currentUser);
  }

  @Get('doctor-account-byId/:id')
  @UseGuards(JwtAuthGuard)
  async getDoctorAccountById(@Param('id') id: string) {
    return this.staffService.getDoctorAccountById(id);
  }
}
