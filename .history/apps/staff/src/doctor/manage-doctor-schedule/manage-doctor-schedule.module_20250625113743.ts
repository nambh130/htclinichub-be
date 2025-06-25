import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManageDoctorScheduleService } from './manage-doctor-schedule.service';
import { ManageDoctorScheduleRepository } from './manage-doctor-schedule.repository';
import { Doctor_WorkShift } from '../../models/doctor_workshift.entity';
import { DoctorModule } from '../doctor.module'; // ✅ import để dùng DoctorRepository

@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor_WorkShift]),
    DoctorModule, // ✅ dùng doctorRepository từ module này
  ],
  providers: [
    ManageDoctorScheduleService,
    ManageDoctorScheduleRepository,
  ],
  exports: [
    ManageDoctorScheduleService,
    ManageDoctorScheduleRepository,
  ],
})
export class ManageDoctorScheduleModule {}
