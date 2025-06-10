import { PostgresAbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { Patient } from './models/patient.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class PatientRepository extends PostgresAbstractRepository<Patient> {
  protected readonly logger = new Logger(PatientRepository.name);

  constructor(
    @InjectRepository(Patient)
    itemsRepository: Repository<Patient>,
    entityManager: EntityManager
  ) {
    super(itemsRepository, entityManager);
  }
}
