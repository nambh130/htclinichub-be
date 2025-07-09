import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ClinicScheduleRuleService } from './clinic_schedule_rule.service';

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
}

