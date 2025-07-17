import { Injectable, Logger } from '@nestjs/common';
import { PostgresAbstractRepository } from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { WebhookEvent } from '../entities/webhook-event.entity';

@Injectable()
export class WebhookEventRepository extends PostgresAbstractRepository<WebhookEvent> {
  protected readonly logger = new Logger(WebhookEventRepository.name);

  private readonly itemsRepository: Repository<WebhookEvent>;

  constructor(
    @InjectRepository(WebhookEvent)
    itemsRepository: Repository<WebhookEvent>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
    this.itemsRepository = itemsRepository;
  }
}
