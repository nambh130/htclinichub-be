import { Injectable, Logger } from '@nestjs/common';
import { PostgresAbstractRepository } from '@app/common';
import { Doctor } from '../models/doctor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, In } from 'typeorm';

@Injectable()
export class ManageDoctorScheduleController extends PostgresAbstractRepository<Doctor> {
  protected readonly logger = new Logger(DoctorRepository.name);

  constructor(
    @InjectRepository(Doctor)
    itemsRepository: Repository<Doctor>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
  }

  async findDoctorsByIds(ids: number[]): Promise<Doctor[]> {
    return this.entityRepository.find({
      where: { id: In(ids) }
    });
  }
}
