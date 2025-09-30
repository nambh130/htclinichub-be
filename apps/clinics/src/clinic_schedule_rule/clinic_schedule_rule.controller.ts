import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ClinicScheduleRuleService } from './clinic_schedule_rule.service';
import { CreateClinicScheduleRuleDto, UpdateClinicScheduleRuleDto } from '@app/common/dto/clinic';
import { TokenPayload } from '@app/common';

@Controller('clinic-schedule-rule')
export class ClinicScheduleRuleController {
  constructor(private readonly clinicScheduleRuleService: ClinicScheduleRuleService) { }

  @Get('get-schedule-rule/:clinicId')
  async getClinicScheduleRuleByClinicId(
    @Param('clinicId') clinicId: string
  ) {
    try {
      const result = await this.clinicScheduleRuleService.getClinicScheduleRuleByClinicId(clinicId);
      return result;
    } catch (error) {
      console.error('Error fetching clinic schedule rule:', error);
      return null; // hoặc return [] hoặc throw lỗi tuỳ mục đích
    }
  }

  @Post('create-schedule-rule/:clinicId')
  async createClinicScheduleRuleByClinicId(
    @Param('clinicId') clinicId: string,
    @Body()
    payload: {
      dto: CreateClinicScheduleRuleDto;
      currentUser: TokenPayload;
    },
  ) {
    try {
      const { dto, currentUser } = payload;
      // console.log(payload);
      const shift = await this.clinicScheduleRuleService.createClinicScheduleRuleByClinicId(clinicId, dto);
      return shift;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }

  @Put('update-schedule-rule/:clinicId')
  async updateClinicScheduleRuleByClinicId(
    @Param('clinicId') clinicId: string,
    @Body()
    payload: {
      dto: UpdateClinicScheduleRuleDto;
      currentUser: TokenPayload;
    },
  ) {
    try {
      const { dto, currentUser } = payload;
      // console.log(payload);
      const shift = await this.clinicScheduleRuleService.updateClinicScheduleRuleByClinicId(clinicId, dto);
      return shift;
    } catch (error) {
      console.error('Error in getPatientById:', error);
      throw error;
    }
  }
}

