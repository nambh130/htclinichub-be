import { Injectable, Logger } from '@nestjs/common';
import { PostgresAbstractRepository } from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { PaymentTransaction } from '../entities/payment-transaction.entity';

@Injectable()
export class PaymentTransactionRepository extends PostgresAbstractRepository<PaymentTransaction> {
  protected readonly logger = new Logger(PaymentTransactionRepository.name);

  private readonly itemsRepository: Repository<PaymentTransaction>;

  constructor(
    @InjectRepository(PaymentTransaction)
    itemsRepository: Repository<PaymentTransaction>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
    this.itemsRepository = itemsRepository;
  }
}
