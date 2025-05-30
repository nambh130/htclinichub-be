import { Injectable, Logger } from '@nestjs/common';
import { PostgresAbstractRepository } from '@app/common';
import { Reservation } from './models/reservation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';

@Injectable()
export class ReservationsPostgresRepository extends PostgresAbstractRepository<Reservation> {
  protected readonly logger = new Logger(ReservationsPostgresRepository.name);

  constructor(
    @InjectRepository(Reservation)
    itemsRepository: Repository<Reservation>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
  }
}
