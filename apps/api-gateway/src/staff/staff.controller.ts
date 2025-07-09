import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { ManageDoctorScheduleService } from './manage-doctor-schedule/manage-doctor-schedule.service';
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

import { ClinicService } from '../clinics/clinic.service';
import { IClinic, IMappedClinicLink } from './interfaces/staff.interface';
import {
  DoctorProfileDto,
  UpdateProfileDto,
} from '@app/common/dto/staffs/doctor-profile.dto';
import { SetupWorkingShiftDto } from '@app/common/dto/staffs/doctor/setup-working-shift.dto';
import { ChangeWorkingShiftDto } from '@app/common/dto/staffs/doctor/change-working-shift.dto';

@Controller('staff')
export class StaffController {
  constructor(

    private readonly staffService: StaffService,
    private readonly manageDoctorScheduleService: ManageDoctorScheduleService,
    private readonly clinicService: ClinicService
  ) { }

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

  @Get('doctor-by-clinic/:clinicId')
  @UseGuards(JwtAuthGuard)
  async getDoctorByClinic(@Param('clinicId') clinicId: string) {
    return this.staffService.getDoctorByClinic(clinicId);
  }

  @Get('clinics-by-doctor')
  @UseGuards(JwtAuthGuard)
  async getClinicByDoctor(
    @CurrentUser() user: TokenPayload
  ) {
    // {linkId, clinicId}
    const doctorClinicsLink =
      await this.staffService.getClinicIdsByDoctor({ userId: user.userId });

    const clinicIds = doctorClinicsLink.map((data) => data.clinic);
  console.log("Clinic Ids 1", clinicIds, doctorClinicsLink);
    const clinics: IClinic[] = await this.clinicService.getClinicByIds(clinicIds);
    console.log("Clinics Ids", clinics);

    const result: IMappedClinicLink[] = doctorClinicsLink.map((link) => {
      const clinicInfo = clinics.find((c) => c.id === link.clinic);
      // console.log("Check", clinicInfo);
      const isAdmin = clinicInfo?.ownerId === user.userId;
      console.log(clinicInfo, isAdmin)
      return {
        link_id: link.linkId,
        clinic: {
          id: clinicInfo?.id ?? '',
          name: clinicInfo?.name ?? '',
          location: clinicInfo?.location ?? '',
          isAdmin
        },
      };
    });

    return result;
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

  @Get('doctor-account-byId/:id')
  @UseGuards(JwtAuthGuard)
  async getDoctorAccountById(@Param('id') id: string) {
    return this.staffService.getDoctorAccountById(id);
  }

  // View Working Hours
  // Set Up Working Hours
  // Change Working Hours

  @Get('/doctor/view-working-shift/:doctorId')
  @UseGuards(JwtAuthGuard)
  async getViewWorkingShift(
    @Param('doctorId') doctorId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const doctor = await this.manageDoctorScheduleService
        .getViewWorkingShiftService(doctorId, user);
      return doctor;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  @Get('/doctor/detail-shift/:shiftId')
  @UseGuards(JwtAuthGuard)
  async getDetailShiftByShiftId(
    @Param('shiftId') shiftId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const doctor = await this.manageDoctorScheduleService
        .getDetailShift(shiftId, user);
      return doctor;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  @Post('/doctor/setup-working-shift/:doctorId')
  @UseGuards(JwtAuthGuard)
  async setUpWorkingShiftByDoctorId(
    @Param('doctorId') doctorId: string,
    @Body() dto: SetupWorkingShiftDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    try {
      // console.log(currentUser);
      const doctor = await this.manageDoctorScheduleService
        .setUpWorkingShiftByDoctorId(dto, doctorId, currentUser);
      return doctor;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  @Put('/doctor/:doctorId/change-working-shift/:shiftId')
  @UseGuards(JwtAuthGuard)
  async changeWorkingShiftByDoctorId(
    @Param('doctorId') doctorId: string,
    @Param('shiftId') shiftId: string,
    @Body() dto: ChangeWorkingShiftDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    try {

      const doctor = await this.manageDoctorScheduleService
        .changeWorkingShiftByDoctorId(dto, doctorId, shiftId, currentUser);
      return doctor;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  @Get('/doctor/shifts-by-date/:date')
  @UseGuards(JwtAuthGuard)
  async getDoctorShiftsByDate(
    @Param('date') date: string,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const shifts = await this.manageDoctorScheduleService.getShiftsInDate(date, user);
      return shifts;
    } catch (error) {
      console.error('Error retrieving shifts:', error);
      throw error;
    }
  }

  @Get('doctor/shifts/:doctorId/:clinicId')
  @UseGuards(JwtAuthGuard)
  async getShiftsByDoctorIdAndClinicId(
    @Param('doctorId') doctorId: string,
    @Param('clinicId') clinicId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const shifts = await this.manageDoctorScheduleService.getShiftsByDoctorIdAndClinicId(doctorId, clinicId, user);
      return shifts;
    } catch (error) {
      console.error('Error retrieving shifts:', error);
      throw error;
    }
  }
  
  
}
