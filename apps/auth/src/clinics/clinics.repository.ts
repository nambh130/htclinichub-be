import { PostgresAbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Clinic } from './models/clinic.entity';

@Injectable()
export class ClinicRepository extends PostgresAbstractRepository<Clinic> {
  protected readonly logger = new Logger(ClinicRepository.name);

  constructor(
    @InjectRepository(Clinic)
    itemsRepository: Repository<Clinic>,
    entityManager: EntityManager
  ) {
    super(itemsRepository, entityManager);
  }
}
