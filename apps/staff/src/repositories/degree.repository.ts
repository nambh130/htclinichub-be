import { Injectable, Logger } from '@nestjs/common';
import { PostgresAbstractRepository } from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Degree } from '../models/degree.entity';

@Injectable()
export class DegreeRepository extends PostgresAbstractRepository<Degree> {
  protected readonly logger = new Logger(DegreeRepository.name);

  private readonly itemsRepository: Repository<Degree>;

  constructor(
    @InjectRepository(Degree)
    itemsRepository: Repository<Degree>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
    this.itemsRepository = itemsRepository;
  }
}
