import { Injectable } from '@nestjs/common';
import { ClinicRepository } from './clinics.repository';
import { Clinic } from './models/clinic.entity';
import { CreateClinicDto } from './dto/create-clinic.dto';

@Injectable()
export class ClinicsService {
  constructor(private readonly clinicRepository: ClinicRepository){}

  async createClinic(createClinicDto: CreateClinicDto): Promise<Clinic>{
    const newClinic = new Clinic(createClinicDto);
    return await this.clinicRepository.create(newClinic);
  }
}
