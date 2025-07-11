import { Injectable, Logger } from '@nestjs/common';
import { PostgresAbstractRepository } from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, In } from 'typeorm';
import { PatientAccount } from '../models';

@Injectable()
export class PatientAccountRepository extends PostgresAbstractRepository<PatientAccount> {
  protected readonly logger = new Logger(PatientAccountRepository.name);

  private readonly itemsRepository: Repository<PatientAccount>;

  constructor(
    @InjectRepository(PatientAccount)
    itemsRepository: Repository<PatientAccount>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
    this.itemsRepository = itemsRepository;
  }

  get repo(): Repository<PatientAccount> {
    return this.itemsRepository;
  }
}
