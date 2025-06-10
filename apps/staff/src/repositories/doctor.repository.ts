import { Injectable, Logger } from '@nestjs/common';
import { ActorType, PostgresAbstractRepository } from '@app/common';
import { Doctor } from '../models/doctor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';

@Injectable()
export class DoctorRepository extends PostgresAbstractRepository<Doctor> {
  protected readonly logger = new Logger(DoctorRepository.name);

  // ✅ Add this line to define the property
  private readonly itemsRepository: Repository<Doctor>;

  constructor(
    @InjectRepository(Doctor)
    itemsRepository: Repository<Doctor>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
    this.itemsRepository = itemsRepository;
  }

  async findActorWithIdAndType(
    type: ActorType,
    id: string,
  ): Promise<{ email: string } | null> {
    const numericId = Number(id);
    if (!type || !numericId) return null;

    switch (type) {
      case 'doctor':
        return await this.itemsRepository.findOne({
          where: { id: numericId },
          select: ['email'],
        });
      default:
        return null;
    }
  }
}
