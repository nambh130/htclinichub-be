import { Injectable, Logger } from '@nestjs/common';
import { PostgresAbstractRepository } from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, In } from 'typeorm';
import { Medicine } from '@clinics/models';

@Injectable()
export class MedicineRepository extends PostgresAbstractRepository<Medicine> {
  protected readonly logger = new Logger(MedicineRepository.name);

  constructor(
    @InjectRepository(Medicine)
    itemsRepository: Repository<Medicine>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
  }
}
