import { Module } from '@nestjs/common';
import { MongoDatabaseModule, LoggerModule, PATIENTS_TO_STAFF_SERVICE, PATIENTS_TO_STAFF_CLIENT, PATIENTS_TO_STAFF_CONSUMER } from '@app/common';
import { ClinicScheduleRuleController } from './clinic_schedule_rule.controller';
import { ClinicScheduleRuleRepository } from './clinic_schedule_rule.repository';
import { ClinicScheduleRuleService } from './clinic_schedule_rule.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicScheduleRule } from '../models/clinic_schedule_rule.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClinicsModule } from '../clinics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClinicScheduleRule]),
    LoggerModule, // nếu dùng logger
  ],
  controllers: [ClinicScheduleRuleController],
  providers: [ClinicScheduleRuleService, ClinicScheduleRuleRepository],
  exports: [ClinicScheduleRuleService, ClinicScheduleRuleRepository],
})
export class ClinicScheduleRuleModule {}

