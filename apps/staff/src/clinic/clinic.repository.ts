import { BaseClinicRepository } from '@app/common/modules/clinic/base-clinics.repository';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Clinic } from '../models/clinic.entity';

@Injectable()
export class ClinicRepository extends BaseClinicRepository<Clinic> {
  protected readonly logger = new Logger(ClinicRepository.name);

  constructor(
    @InjectRepository(Clinic)
    itemsRepository: Repository<Clinic>,
    entityManager: EntityManager
  ) {
    super(itemsRepository, entityManager);
  }
}

