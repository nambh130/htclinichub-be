import { Injectable } from '@nestjs/common';
import { CreateDoctorAccountDto } from '@app/common';
import { DoctorRepository } from './doctor.repository';
import { Doctor } from '../models/doctor.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DoctorService {
  constructor(private readonly doctorRepository: DoctorRepository) {}

  async createDoctorAccount(dto: CreateDoctorAccountDto): Promise<Doctor> {
    const doctor = new Doctor();
    doctor.email = dto.email;
    doctor.password = await bcrypt.hash(dto.password, 10);

    return this.doctorRepository.create(doctor);
  }
}
