import { Inject, Injectable } from '@nestjs/common';
import { CLINIC_SERVICE } from '@app/common';
import { ClientKafka } from '@nestjs/microservices';
import { AddClinicDto } from '@app/common/dto/clinic';
import { ClinicRepository } from './clinic.repository';
import { Clinic } from './models';

@Injectable()
export class ClinicsService {
  constructor(
    private readonly clinicsRepository: ClinicRepository,
    @Inject(CLINIC_SERVICE)
    private readonly clinicsClient: ClientKafka,
  ) {}

  async addClinic(addClinicDto: AddClinicDto, userId: string) {
    if (!addClinicDto?.name || !addClinicDto?.location) {
      throw new Error('Invalid clinic data');
    }

    const newClinic = new Clinic();
    newClinic.name = addClinicDto.name;
    newClinic.location = addClinicDto.location;
    newClinic.ownerId = addClinicDto.ownerId;
    newClinic.createdBy = userId;
    const clinic = await this.clinicsRepository.create(newClinic);

    this.clinicsClient.emit('clinic-added', {
      id: clinic.id,
      name: clinic.name,
      location: clinic.location,
      ownerId: clinic.ownerId,
      createdBy: clinic.createdBy,
    });

    return clinic;
  }
}
