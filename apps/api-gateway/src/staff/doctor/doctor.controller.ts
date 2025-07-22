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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { ManageDoctorScheduleService } from '../manage-doctor-schedule/manage-doctor-schedule.service';
import {
  CreateDoctorAccountDto,
  CurrentUser,
  DoctorDegreeDto,
  DoctorSpecializeDto,
  JwtAuthGuard,
  TokenPayload,
  UpdateDegreeDto,
  UpdateSpecializeDto,
} from '@app/common';

import { ClinicService } from '../../clinics/clinic.service';
import { IMappedClinicLink } from '../interfaces/staff.interface';
import { DoctorProfileDto, UpdateProfileDto } from '@app/common';
import { SetupWorkingShiftDto } from '@app/common/dto/staffs/doctor/setup-working-shift.dto';
import { ChangeWorkingShiftDto } from '@app/common/dto/staffs/doctor/change-working-shift.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ImportMedicineDto,
  UpdateMedicineDto,
} from '@app/common/dto/staffs/medicine';

@Controller('staff/doctor')
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly manageDoctorScheduleService: ManageDoctorScheduleService,
    private readonly clinicService: ClinicService,
  ) {}

  // ============================================================================
  // DOCTOR ACCOUNT MANAGEMENT
  // ============================================================================

  @Get('account-list')
  @UseGuards(JwtAuthGuard)
  async getDoctorAccountList(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.doctorService.getDoctorAccountList(+page, +limit);
  }

  @Get('account-list-with-profile')
  @UseGuards(JwtAuthGuard)
  async getDoctorListWithProfile(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('searchField') searchField?: 'name' | 'email' | 'phone' | 'all',
    @Query('clinicId') clinicId?: string,
  ) {
    return await this.doctorService.getDoctorListWithProfile(
      +page,
      +limit,
      search,
      searchField,
      clinicId,
    );
  }

  @Get('doctor-by-clinic/:clinicId')
  @UseGuards(JwtAuthGuard)
  async getDoctorByClinic(@Param('clinicId') clinicId: string) {
    return this.doctorService.getDoctorByClinic(clinicId);
  }

  @Get('clinics-by-doctor')
  @UseGuards(JwtAuthGuard)
  async getClinicByDoctor(
    @CurrentUser() user: TokenPayload,
  ): Promise<IMappedClinicLink[]> {
    const doctorClinicsLink = await this.doctorService.getClinicIdsByDoctor(
      user.userId,
    );

    const result: IMappedClinicLink[] = doctorClinicsLink.map((link) => {
      const clinicInfo = link.clinic;
      const isAdmin = clinicInfo?.ownerId === user.userId;

      return {
        link_id: link.linkId,
        clinic: {
          id: clinicInfo?.id ?? '',
          name: clinicInfo?.name ?? '',
          location: clinicInfo?.location ?? '',
          isAdmin,
        },
      };
    });

    return result;
  }

  @Get('details/:id')
  @UseGuards(JwtAuthGuard)
  async getDoctorDetailsById(@Param('id') doctorId: string) {
    return await this.doctorService.getDoctorDetailsById(doctorId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getDoctorById(@Param('id') doctorId: string) {
    return await this.doctorService.getDoctorById(doctorId);
  }

  @Post('create-account')
  @UseGuards(JwtAuthGuard)
  async createDoctorAccount(
    @Body() dto: CreateDoctorAccountDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.doctorService.createDoctorAccount(dto, currentUser);
  }

  @Post('lock/:id')
  @UseGuards(JwtAuthGuard)
  async lockDoctorAccount(
    @Param('id') id: string,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.doctorService.lockDoctorAccount(id, currentUser);
  }

  @Post('unlock/:id')
  @UseGuards(JwtAuthGuard)
  async unlockDoctorAccount(
    @Param('id') id: string,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.doctorService.unlockDoctorAccount(id, currentUser);
  }

  // ============================================================================
  // DOCTOR PROFILE MANAGEMENT
  // ============================================================================

  @Get(':id/profile')
  @UseGuards(JwtAuthGuard)
  async getStaffInfoByDoctorId(@Param('id') doctorId: string) {
    return this.doctorService.getStaffInfoByDoctorId(doctorId);
  }

  @Post(':id/create-profile')
  @UseGuards(JwtAuthGuard)
  async createDoctorProfile(
    @Param('id') staffId: string,
    @Body() dto: DoctorProfileDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.doctorService.createDoctorProfile(staffId, dto, currentUser);
  }

  @Post(':id/update-profile')
  @UseGuards(JwtAuthGuard)
  async updateDoctorProfile(
    @Param('id') doctorId: string,
    @Body() dto: UpdateProfileDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.doctorService.updateDoctorProfile(doctorId, dto, currentUser);
  }

  // ============================================================================
  // DOCTOR DEGREES MANAGEMENT
  // ============================================================================

  @Get(':id/degrees')
  @UseGuards(JwtAuthGuard)
  getDegreesByDoctorId(@Param('id') doctorId: string) {
    return this.doctorService.getDegreesByDoctorId(doctorId);
  }

  @Post(':id/add-degree')
  @UseGuards(JwtAuthGuard)
  addDoctorDegree(
    @Param('id') doctorId: string,
    @Body() dto: DoctorDegreeDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.doctorService.addDoctorDegree(doctorId, dto, currentUser);
  }

  @Post(':id/update-degree/:degreeId')
  @UseGuards(JwtAuthGuard)
  updateDoctorDegree(
    @Param('id') doctorId: string,
    @Param('degreeId') degreeId: string,
    @Body() dto: UpdateDegreeDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.doctorService.updateDoctorDegree(
      doctorId,
      degreeId,
      dto,
      currentUser,
    );
  }

  @Delete(':id/delete-degree/:degreeId')
  @UseGuards(JwtAuthGuard)
  deleteDoctorDegree(
    @Param('id') doctorId: string,
    @Param('degreeId') degreeId: string,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.doctorService.deleteDoctorDegree(
      doctorId,
      degreeId,
      currentUser,
    );
  }

  // ============================================================================
  // DOCTOR SPECIALIZATIONS MANAGEMENT
  // ============================================================================

  @Get(':id/specializes')
  @UseGuards(JwtAuthGuard)
  getSpecializesByDoctorId(@Param('id') doctorId: string) {
    return this.doctorService.getSpecializesByDoctorId(doctorId);
  }

  @Post(':id/add-specialize')
  @UseGuards(JwtAuthGuard)
  addDoctorSpecialize(
    @Param('id') doctorId: string,
    @Body() dto: DoctorSpecializeDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.doctorService.addDoctorSpecialize(doctorId, dto, currentUser);
  }

  @Post(':id/update-specialize/:specializeId')
  @UseGuards(JwtAuthGuard)
  updateDoctorSpecialize(
    @Param('id') doctorId: string,
    @Param('specializeId') specializeId: string,
    @Body() dto: UpdateSpecializeDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.doctorService.updateDoctorSpecialize(
      doctorId,
      specializeId,
      dto,
      currentUser,
    );
  }

  @Delete(':id/delete-specialize/:specializeId')
  @UseGuards(JwtAuthGuard)
  deleteDoctorSpecialize(
    @Param('id') doctorId: string,
    @Param('specializeId') specializeId: string,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.doctorService.deleteDoctorSpecialize(
      doctorId,
      specializeId,
      currentUser,
    );
  }

  @Get('doctor-account-byId/:id')
  @UseGuards(JwtAuthGuard)
  async getDoctorAccountById(@Param('id') id: string) {
    return this.doctorService.getDoctorAccountById(id);
  }

  // ============================================================================
  // DOCTOR CLINIC ASSIGNMENT
  // ============================================================================

  @Post(':id/assign-clinic/:clinicId')
  @UseGuards(JwtAuthGuard)
  async assignDoctorToClinic(
    @Param('id') doctorId: string,
    @Param('clinicId') clinicId: string,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.doctorService.assignDoctorToClinic(
      doctorId,
      clinicId,
      currentUser,
    );
  }

  @Delete('remove-clinic/:id/:clinicId')
  @UseGuards(JwtAuthGuard)
  async removeDoctorFromClinic(
    @Param('id') doctorId: string,
    @Param('clinicId') clinicId: string,
  ) {
    return this.doctorService.removeDoctorFromClinic(doctorId, clinicId);
  }

  @Get('/view-working-shift/:doctorId')
  @UseGuards(JwtAuthGuard)
  async getViewWorkingShift(
    @Param('doctorId') doctorId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const doctor =
        await this.manageDoctorScheduleService.getViewWorkingShiftService(
          doctorId,
          user,
        );
      return doctor;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  @Get('/detail-shift/:shiftId')
  @UseGuards(JwtAuthGuard)
  async getDetailShiftByShiftId(
    @Param('shiftId') shiftId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const doctor = await this.manageDoctorScheduleService.getDetailShift(
        shiftId,
        user,
      );
      return doctor;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  @Post('/setup-working-shift/:doctorId')
  @UseGuards(JwtAuthGuard)
  async setUpWorkingShiftByDoctorId(
    @Param('doctorId') doctorId: string,
    @Body() dto: SetupWorkingShiftDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    try {
      // console.log(currentUser);
      const doctor =
        await this.manageDoctorScheduleService.setUpWorkingShiftByDoctorId(
          dto,
          doctorId,
          currentUser,
        );
      return doctor;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  @Put('/:doctorId/change-working-shift/:shiftId')
  @UseGuards(JwtAuthGuard)
  async changeWorkingShiftByDoctorId(
    @Param('doctorId') doctorId: string,
    @Param('shiftId') shiftId: string,
    @Body() dto: ChangeWorkingShiftDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    try {
      const doctor =
        await this.manageDoctorScheduleService.changeWorkingShiftByDoctorId(
          dto,
          doctorId,
          shiftId,
          currentUser,
        );
      return doctor;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }

  @Get('/shifts-by-date/:clinicId/:doctorId/:date')
  @UseGuards(JwtAuthGuard)
  async getDoctorShiftsByDate(
    @Param('clinicId') clinicId: string,
    @Param('doctorId') doctorId: string,
    @Param('date') date: string,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const shifts = await this.manageDoctorScheduleService.getShiftsInDate(
        clinicId,
        doctorId,
        date,
        user,
      );
      return shifts;
    } catch (error) {
      console.error('Error retrieving shifts:', error);
      throw error;
    }
  }

  @Get('/shifts/:doctorId/:clinicId')
  @UseGuards(JwtAuthGuard)
  async getShiftsByDoctorIdAndClinicId(
    @Param('doctorId') doctorId: string,
    @Param('clinicId') clinicId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    try {
      const shifts =
        await this.manageDoctorScheduleService.getShiftsByDoctorIdAndClinicId(
          doctorId,
          clinicId,
          user,
        );
      return shifts;
    } catch (error) {
      console.error('Error retrieving shifts:', error);
      throw error;
    }
  }
}
