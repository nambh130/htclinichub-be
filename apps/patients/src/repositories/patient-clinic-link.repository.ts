import { Injectable, Logger } from '@nestjs/common';
import { PostgresAbstractRepository } from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, In } from 'typeorm';
import { PatientAccount } from '../models';
import { PatientClinicLink } from '../models/patient_clinic_link.entity';

@Injectable()
export class PatientClinicLinkRepository extends PostgresAbstractRepository<PatientClinicLink> {
  protected readonly logger = new Logger(PatientClinicLinkRepository.name);

  private readonly itemsRepository: Repository<PatientClinicLink>;

  constructor(
    @InjectRepository(PatientClinicLink)
    itemsRepository: Repository<PatientClinicLink>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
    this.itemsRepository = itemsRepository;
  }

  get repo(): Repository<PatientClinicLink> {
    return this.itemsRepository;
  }
}
