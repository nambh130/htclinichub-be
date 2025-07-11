import { PostgresAbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ClinicRepository } from '../clinics/clinics.repository';
import { Permission } from './models/permission.entity';

@Injectable()
export class PermissionRepository extends PostgresAbstractRepository<Permission> {
  protected readonly logger = new Logger(ClinicRepository.name);

  constructor(
    @InjectRepository(Permission)
    itemsRepository: Repository<Permission>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
  }
}
