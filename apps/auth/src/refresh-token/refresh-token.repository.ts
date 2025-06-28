import { PostgresAbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RefreshToken } from './models/refresh-token.model';

@Injectable()
export class RefreshTokenRepository extends PostgresAbstractRepository<RefreshToken> {
  protected readonly logger = new Logger(RefreshTokenRepository.name);

  constructor(
    @InjectRepository(RefreshToken)
    itemsRepository: Repository<RefreshToken>,
    entityManager: EntityManager
  ) {
    super(itemsRepository, entityManager);
  }
}



