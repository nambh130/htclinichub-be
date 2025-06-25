import { Injectable, Logger } from '@nestjs/common';
import { Repository, EntityManager } from 'typeorm';
import { PostgresAbstractRepository } from '@app/common';
import { BaseClinic } from './models/base-clinic.entity';

@Injectable()
export class BaseClinicRepository<T extends BaseClinic> extends PostgresAbstractRepository<T> {
  protected readonly logger = new Logger(BaseClinicRepository.name);

  constructor(
    clinicRepo: Repository<T>,
    entityManager: EntityManager,
  ) {
    super(clinicRepo, entityManager);
  }
}
