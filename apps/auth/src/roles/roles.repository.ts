import { PostgresAbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Role } from './models/role.entity';

@Injectable()
export class RoleRepository extends PostgresAbstractRepository<Role> {
  protected readonly logger = new Logger(RoleRepository.name);

  constructor(
    @InjectRepository(Role)
    itemsRepository: Repository<Role>,
    entityManager: EntityManager
  ) {
    super(itemsRepository, entityManager);
  }
}


