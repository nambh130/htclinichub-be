import { Inject, Injectable } from '@nestjs/common';
import { CLINIC_SERVICE } from '@app/common';
import { ClientKafka } from '@nestjs/microservices';
import { AddClinicDto } from '@app/common/dto/clinic';
import { ClinicRepository } from './clinic.repository';

@Injectable()
export class ClinicsService {
  constructor(
    private readonly clinicsRepository: ClinicRepository,
    @Inject(CLINIC_SERVICE)
    private readonly clinicsClient: ClientKafka,
  ) {}

  async addClinic(addClinicDto: AddClinicDto) {
    const clinic = await this.clinicsRepository.create({
      name: addClinicDto.name,
      location: addClinicDto.location,
    });

    this.clinicsClient.emit('clinic-added', {
      name: clinic.name,
      location: clinic.location,
    });

    return clinic;
  }
}
