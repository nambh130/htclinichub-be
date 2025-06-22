import { Injectable, Logger } from '@nestjs/common';
import { PostgresAbstractRepository } from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { StaffInfo } from '../models/staffInfo.entity';

@Injectable()
export class StaffInfoRepository extends PostgresAbstractRepository<StaffInfo> {
  protected readonly logger = new Logger(StaffInfoRepository.name);

  private readonly itemsRepository: Repository<StaffInfo>;

  constructor(
    @InjectRepository(StaffInfo)
    itemsRepository: Repository<StaffInfo>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
    this.itemsRepository = itemsRepository;
  }
}
