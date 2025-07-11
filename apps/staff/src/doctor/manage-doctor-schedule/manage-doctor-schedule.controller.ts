import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ActorType, CreateDoctorAccountDto, CurrentUser, TokenPayload } from '@app/common';
import { ManageDoctorScheduleService } from './manage-doctor-schedule.service';
import { SetupWorkingShiftDto } from '@app/common/dto/staffs/doctor/setup-working-shift.dto';
import { ChangeWorkingShiftDto } from '@app/common/dto/staffs/doctor/change-working-shift.dto';

@Controller('manage-doctor-schedule')
export class ManageDoctorScheduleController {
  constructor(private readonly manageDoctorScheduleService: ManageDoctorScheduleService) { }

  @Get('doctor-view-working-shift/:doctorId')
  async getViewWorkingShiftController(
    @Param('doctorId') doctorId: string,
  ) {
    try {
      const doctor = await this.manageDoctorScheduleService.getViewWorkingShiftService(doctorId);
      return doctor;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }

  @Get('detail-working-shift/:shiftId')
  async getDetailShiftController(
    @Param('shiftId') shiftId: string,
  ) {
    try {
      console.log("[DEBUG]: " + shiftId)
      const shift = await this.manageDoctorScheduleService.getDetailShiftService(shiftId);
      return shift;
    } catch (error) {
      console.error('Error in:', error);
      throw error;
    }
  }

  @Post('setup-working-shift/:doctorId')
  async setUpWorkingShiftByDoctorId(
    @Param('doctorId') doctorId: string,
    @Body()
    payload: {
      dto: SetupWorkingShiftDto;
      currentUser: TokenPayload;
    },
  ) {
    try {
      const { dto, currentUser } = payload;
      console.log(payload);
      const shift = await this.manageDoctorScheduleService
        .setUpWorkingShiftByDoctorId(doctorId, dto, currentUser);
      return shift;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }

  @Put(':doctorId/change-working-shift/:shiftId')
  async changeWorkingShiftByDoctorId(
    @Param('shiftId') shiftId: string,
    @Param('doctorId') doctorId: string,
    @Body()
    payload: {
      dto: ChangeWorkingShiftDto;
      currentUser: TokenPayload;
    },
  ) {
    try {
      const { dto, currentUser } = payload;

      const shift = await this.manageDoctorScheduleService.changeWorkingShiftByDoctorId(
        dto,
        doctorId,
        shiftId,
        currentUser,
      );

      return shift;
    } catch (error) {
      console.error('Error in changeWorkingShiftByDoctorId controller:', error);
      throw error;
    }
  }

  @Get('/doctor/shifts-by-date/:clinicId/:doctorId/:date')
  getDoctorShiftsByDate(
    @Param('date') date: string,
    @Param('clinicId') clinicId: string,
    @Param('doctorId') doctorId: string,
  ) {
    return this.manageDoctorScheduleService.getShiftsInDate(date, doctorId, clinicId);
  }

  @Get('/doctor/shifts-by-doctor-id-and-clinic-id/:doctorId/:clinicId')
  getShiftsByDoctorIdAndClinicId(
    @Param('doctorId') doctorId: string,
    @Param('clinicId') clinicId: string,
  ) {
    return this.manageDoctorScheduleService.getShiftsByDoctorIdAndClinicId(doctorId, clinicId);
  }

  @Put('/doctor/shift/:shiftId/status/fully-booked')
  updateShift(@Param('shiftId') shiftId: string) {
    return this.manageDoctorScheduleService.updateShifttFull(shiftId);
  }


}
