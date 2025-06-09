import { Injectable } from '@nestjs/common';
import { CreateDoctorAccountDto } from '@app/common';
import { DoctorRepository } from './doctor.repository';
import { Doctor } from '../models/doctor.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DoctorService {
  constructor(
    private readonly doctorRepository: DoctorRepository,
  ) {}

  async createDoctorAccount(dto: CreateDoctorAccountDto): Promise<Doctor> {
    const doctor = new Doctor();
    doctor.email = dto.email;
    doctor.password = await bcrypt.hash(dto.password, 10);

    return this.doctorRepository.create(doctor);
  }

async getDoctorsByIds(data: { ids: number[] }) {
    console.log('This is a mock response from Doctor Service, received IDs:', data.ids);

    const formatData = data.ids.map(id => ({
        name: `Doctor ${id}`,
        email: `doctor${id}@example.com`,
    }));

    console.log('Formatted doctor mock data:', formatData);

    return formatData;
}

}
