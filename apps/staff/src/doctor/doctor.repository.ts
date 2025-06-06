import { Injectable, Logger } from '@nestjs/common';
import { PostgresAbstractRepository } from '@app/common';
import { Doctor } from '../models/doctor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';

@Injectable()
export class DoctorRepository extends PostgresAbstractRepository<Doctor> {
  protected readonly logger = new Logger(DoctorRepository.name);

  constructor(
    @InjectRepository(Doctor)
    itemsRepository: Repository<Doctor>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
  }
}
