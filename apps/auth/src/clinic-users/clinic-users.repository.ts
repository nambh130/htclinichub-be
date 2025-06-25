import { PostgresAbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ClinicUser } from './models/clinic-user.entity';
import { ClinicRepository } from '../clinics/clinics.repository';

@Injectable()
export class ClinicUserRepository extends PostgresAbstractRepository<ClinicUser> {
  protected readonly logger = new Logger(ClinicRepository.name);

  constructor(
    @InjectRepository(ClinicUser)
    itemsRepository: Repository<ClinicUser>,
    entityManager: EntityManager
  ) {
    super(itemsRepository, entityManager);
  }
}
