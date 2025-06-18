import { Injectable, NotFoundException } from '@nestjs/common';
import { ClinicRepository } from './clinics.repository';
import { Clinic } from './models/clinic.entity';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { ClinicUserRepository } from '../clinic-users/clinic-users.repository';

@Injectable()
export class ClinicsService {
  constructor(
    private readonly clinicRepository: ClinicRepository,
    private readonly clinicUserRepository: ClinicUserRepository
  ) { }

  async createClinic(createClinicDto: CreateClinicDto): Promise<Clinic> {
    try {
      const owner = await this.clinicUserRepository.findOne(
        { id: createClinicDto.owner },
      );
      const newClinic = new Clinic({
        ...createClinicDto,
        owner
      });
      return await this.clinicRepository.create(newClinic);
    } catch (error) {
      throw new NotFoundException('Clinic owner not found');
    }
  }

  async getClinics() {
    return await this.clinicRepository.findAll();
  }
}
