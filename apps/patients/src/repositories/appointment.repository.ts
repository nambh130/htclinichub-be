import { Injectable, Logger } from '@nestjs/common';
import { PostgresAbstractRepository } from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, In } from 'typeorm';
import { PatientAccount } from '../models';
import { Appointment } from '../models/appointment.entity';

@Injectable()
export class AppointmentRepository extends PostgresAbstractRepository<Appointment> {
  protected readonly logger = new Logger(AppointmentRepository.name);

  private readonly itemsRepository: Repository<Appointment>;

  constructor(
    @InjectRepository(Appointment)
    itemsRepository: Repository<Appointment>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
    this.itemsRepository = itemsRepository;
  }

  get repo(): Repository<Appointment> {
    return this.itemsRepository;
  }
}
