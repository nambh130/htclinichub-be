import { Injectable } from '@nestjs/common';
import { DoctorRepository } from './repositories/doctor.repository';
import { CreateDoctorAccountDto } from '@app/common';
import { Doctor } from './models/doctor.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffService {
  constructor(private readonly doctorRepository: DoctorRepository) {}

  async createDoctorAccount(dto: CreateDoctorAccountDto): Promise<Doctor> {
    const doctor = new Doctor();
    doctor.email = dto.email;
    doctor.password = await bcrypt.hash(dto.password, 10);

    return this.doctorRepository.create(doctor);
  }
}
