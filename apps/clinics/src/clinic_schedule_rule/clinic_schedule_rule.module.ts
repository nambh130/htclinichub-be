import { forwardRef, Module } from '@nestjs/common';
import { LoggerModule } from '@app/common';
import { ClinicScheduleRuleController } from './clinic_schedule_rule.controller';
import { ClinicScheduleRuleRepository } from './clinic_schedule_rule.repository';
import { ClinicScheduleRuleService } from './clinic_schedule_rule.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClinicScheduleRule } from '../models/clinic_schedule_rule.entity';
import { ClinicsModule } from '@clinics/clinics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClinicScheduleRule]),
    LoggerModule,
    forwardRef(() => ClinicsModule),
  ],
  controllers: [ClinicScheduleRuleController],
  providers: [ClinicScheduleRuleService, ClinicScheduleRuleRepository],
  exports: [ClinicScheduleRuleService, ClinicScheduleRuleRepository],
})
export class ClinicScheduleRuleModule { }

