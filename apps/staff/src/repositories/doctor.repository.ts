import { Injectable, Logger } from '@nestjs/common';
import { PostgresAbstractRepository } from '@app/common';
import { Doctor } from '../models/doctor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';

@Injectable()
export class DoctorRepository extends PostgresAbstractRepository<Doctor> {
  protected readonly logger = new Logger(DoctorRepository.name);

  private readonly itemsRepository: Repository<Doctor>;

  constructor(
    @InjectRepository(Doctor)
    itemsRepository: Repository<Doctor>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
    this.itemsRepository = itemsRepository;
  }

  async checkDoctorEmailExists(email: string): Promise<boolean> {
    const normalizedEmail = email.trim().toLowerCase();
    const doctor = await this.itemsRepository.findOne({
      where: { email: normalizedEmail },
    });
    return doctor !== null;
  }

  get repo(): Repository<Doctor> {
    return this.itemsRepository;
  }
}
