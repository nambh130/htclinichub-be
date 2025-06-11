import { Injectable } from '@nestjs/common';
import { ClinicRepository } from './clinics.repository';
import { Clinic } from './models/clinic.entity';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { ClinicUser } from '../clinic-users/models/clinic-user.entity';

@Injectable()
export class ClinicsService {
  constructor(private readonly clinicRepository: ClinicRepository) { }

  async createClinic(createClinicDto: CreateClinicDto): Promise<Clinic> {
    const newClinic = new Clinic({
      ...createClinicDto,
      owner: { id: createClinicDto.owner } as ClinicUser
    });
    return await this.clinicRepository.create(newClinic);
  }

  async getClinics() {
    return await this.clinicRepository.findAll();
  }
}
