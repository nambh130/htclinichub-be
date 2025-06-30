import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Delete,
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
  UpdateDegreeDto,
  UpdateSpecializeDto,
} from '@app/common';
import {
  DoctorProfileDto,
  UpdateProfileDto,
} from '@app/common/dto/staffs/doctor-profile.dto';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  // ============================================================================
  // DOCTOR ACCOUNT MANAGEMENT
  // ============================================================================

  @Get('doctor/account-list')
  @UseGuards(JwtAuthGuard)
  async getDoctorAccountList(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.staffService.getDoctorAccountList(+page, +limit);
  }

  @Get('doctor/account-list-with-profile')
  @UseGuards(JwtAuthGuard)
  async getDoctorListWithProfile(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return await this.staffService.getDoctorListWithProfile(+page, +limit);
  }

  @Get('doctor/:id')
  @UseGuards(JwtAuthGuard)
  async getDoctorById(@Param('id') doctorId: string) {
    return await this.staffService.getDoctorById(doctorId);
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

  // ============================================================================
  // DOCTOR PROFILE MANAGEMENT
  // ============================================================================

  @Get('doctor/:id/profile')
  @UseGuards(JwtAuthGuard)
  async getStaffInfoByDoctorId(@Param('id') doctorId: string) {
    return this.staffService.getStaffInfoByDoctorId(doctorId);
  }

  @Post('doctor/:id/create-profile')
  @UseGuards(JwtAuthGuard)
  async createDoctorProfile(
    @Param('id') staffId: string,
    @Body() dto: DoctorProfileDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.staffService.createDoctorProfile(staffId, dto, currentUser);
  }

  @Post('doctor/:id/update-profile')
  @UseGuards(JwtAuthGuard)
  async updateDoctorProfile(
    @Param('id') doctorId: string,
    @Body() dto: UpdateProfileDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.staffService.updateDoctorProfile(doctorId, dto, currentUser);
  }

  // ============================================================================
  // DOCTOR DEGREES MANAGEMENT
  // ============================================================================

  @Get('doctor/:id/degrees')
  @UseGuards(JwtAuthGuard)
  getDegreesByDoctorId(@Param('id') doctorId: string) {
    return this.staffService.getDegreesByDoctorId(doctorId);
  }

  @Post('doctor/:id/add-degree')
  @UseGuards(JwtAuthGuard)
  addDoctorDegree(
    @Param('id') doctorId: string,
    @Body() dto: DoctorDegreeDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.staffService.addDoctorDegree(doctorId, dto, currentUser);
  }

  @Post('doctor/:id/update-degree/:degreeId')
  @UseGuards(JwtAuthGuard)
  updateDoctorDegree(
    @Param('id') doctorId: string,
    @Param('degreeId') degreeId: string,
    @Body() dto: UpdateDegreeDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.staffService.updateDoctorDegree(
      doctorId,
      degreeId,
      dto,
      currentUser,
    );
  }

  @Delete('doctor/:id/delete-degree/:degreeId')
  @UseGuards(JwtAuthGuard)
  deleteDoctorDegree(
    @Param('id') doctorId: string,
    @Param('degreeId') degreeId: string,
  ) {
    return this.staffService.deleteDoctorDegree(doctorId, degreeId);
  }

  // ============================================================================
  // DOCTOR SPECIALIZATIONS MANAGEMENT
  // ============================================================================

  @Get('doctor/:id/specializes')
  @UseGuards(JwtAuthGuard)
  getSpecializesByDoctorId(@Param('id') doctorId: string) {
    return this.staffService.getSpecializesByDoctorId(doctorId);
  }

  @Post('doctor/:id/add-specialize')
  @UseGuards(JwtAuthGuard)
  addDoctorSpecialize(
    @Param('id') doctorId: string,
    @Body() dto: DoctorSpecializeDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.staffService.addDoctorSpecialize(doctorId, dto, currentUser);
  }

  @Post('doctor/:id/update-specialize/:specializeId')
  @UseGuards(JwtAuthGuard)
  updateDoctorSpecialize(
    @Param('id') doctorId: string,
    @Param('specializeId') specializeId: string,
    @Body() dto: UpdateSpecializeDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.staffService.updateDoctorSpecialize(
      doctorId,
      specializeId,
      dto,
      currentUser,
    );
  }

  @Delete('doctor/:id/delete-specialize/:specializeId')
  @UseGuards(JwtAuthGuard)
  deleteDoctorSpecialize(
    @Param('id') doctorId: string,
    @Param('specializeId') specializeId: string,
  ) {
    return this.staffService.deleteDoctorSpecialize(doctorId, specializeId);
  }

  // ============================================================================
  // EMPLOYEE MANAGEMENT
  // ============================================================================

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
}
