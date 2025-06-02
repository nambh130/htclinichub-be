import { Injectable, Logger } from '@nestjs/common';
import { Clinic } from './models/clinics.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PostgresAbstractRepository } from '@app/common';

@Injectable()
export class ClinicRepository extends PostgresAbstractRepository<Clinic> {
  protected readonly logger = new Logger(ClinicRepository.name);
  constructor(
    @InjectRepository(Clinic)
    itemsRepository: Repository<Clinic>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
  }
}
