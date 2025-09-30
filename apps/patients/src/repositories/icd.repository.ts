import { Injectable, Logger } from '@nestjs/common';
import { PostgresAbstractRepository } from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, In } from 'typeorm';
import { PatientAccount } from '../models';
import { Appointment } from '../models/appointment.entity';
import { ICD } from '../models/icd.entity';

@Injectable()
export class ICDRepository extends PostgresAbstractRepository<ICD> {
  protected readonly logger = new Logger(ICDRepository.name);

  private readonly itemsRepository: Repository<ICD>;

  constructor(
    @InjectRepository(ICD)
    itemsRepository: Repository<ICD>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
    this.itemsRepository = itemsRepository;
  }

  get repo(): Repository<ICD> {
    return this.itemsRepository;
  }
}
