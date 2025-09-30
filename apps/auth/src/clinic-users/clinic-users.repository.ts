import { PostgresAbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User } from './models/clinic-user.entity';
import { ClinicRepository } from '../clinics/clinics.repository';

@Injectable()
export class ClinicUserRepository extends PostgresAbstractRepository<User> {
  protected readonly logger = new Logger(ClinicRepository.name);

  constructor(
    @InjectRepository(User)
    itemsRepository: Repository<User>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
  }
}
