import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { DoctorRepository } from './doctor.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from '../models/doctor.entity';
import { EmployeeInfo } from '../models/employeeInfo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor, EmployeeInfo])],
  controllers: [DoctorController],
  providers: [DoctorService, DoctorRepository],
  exports: [DoctorService, DoctorRepository],
})
export class DoctorModule {}
