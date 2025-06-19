import { PostgresAbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { EmployeeInvitation } from './models/invitation.entity';

@Injectable()
export class InvitationRepository extends PostgresAbstractRepository<EmployeeInvitation> {
  protected readonly logger = new Logger(InvitationRepository.name);

  constructor(
    @InjectRepository(EmployeeInvitation)
    itemsRepository: Repository<EmployeeInvitation>,
    entityManager: EntityManager
  ) {
    super(itemsRepository, entityManager);
  }
}

