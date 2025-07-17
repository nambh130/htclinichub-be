import { Injectable, Logger } from '@nestjs/common';
import { PostgresAbstractRepository } from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { PaymentConfig } from '../entities/payment-config.entity';

@Injectable()
export class PaymentConfigRepository extends PostgresAbstractRepository<PaymentConfig> {
  protected readonly logger = new Logger(PaymentConfigRepository.name);

  private readonly itemsRepository: Repository<PaymentConfig>;

  constructor(
    @InjectRepository(PaymentConfig)
    itemsRepository: Repository<PaymentConfig>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
    this.itemsRepository = itemsRepository;
  }
}
