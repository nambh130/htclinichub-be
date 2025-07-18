import { Injectable, Logger } from '@nestjs/common';
import { PostgresAbstractRepository } from '@app/common';
import { Payment } from '../entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';

@Injectable()
export class PaymentRepository extends PostgresAbstractRepository<Payment> {
  protected readonly logger = new Logger(PaymentRepository.name);

  private readonly itemsRepository: Repository<Payment>;

  constructor(
    @InjectRepository(Payment)
    itemsRepository: Repository<Payment>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
    this.itemsRepository = itemsRepository;
  }
}
