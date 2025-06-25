import { Injectable } from '@nestjs/common';
import { DoctorRepository } from './repositories/doctor.repository';

@Injectable()
export class StaffService {
  constructor(private readonly doctorRepository: DoctorRepository) {}
}
