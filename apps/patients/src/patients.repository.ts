import { Injectable, Logger } from '@nestjs/common';
import { Patient } from './models/patients.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PostgresAbstractRepository } from '@app/common';

@Injectable()
export class PatientRepository extends PostgresAbstractRepository<Patient> {
  protected readonly logger = new Logger(PatientRepository.name);
  constructor(
    @InjectRepository(Patient)
    itemsRepository: Repository<Patient>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
  }
}
