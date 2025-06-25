import { Injectable, Logger } from '@nestjs/common';
import { PostgresAbstractRepository } from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Specialize } from '../models/specialize.entity';

@Injectable()
export class SpecializeRepository extends PostgresAbstractRepository<Specialize> {
  protected readonly logger = new Logger(SpecializeRepository.name);

  private readonly itemsRepository: Repository<Specialize>;

  constructor(
    @InjectRepository(Specialize)
    itemsRepository: Repository<Specialize>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
    this.itemsRepository = itemsRepository;
  }
}
