import { Injectable, Logger } from '@nestjs/common';
import { Clinic } from '../models/clinics.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PostgresAbstractRepository } from '@app/common';
import { ClinicScheduleRule } from '../models/clinic_schedule_rule.entity';

@Injectable()
export class ClinicScheduleRuleRepository extends PostgresAbstractRepository<ClinicScheduleRule> {
  protected readonly logger = new Logger(ClinicScheduleRuleRepository.name);

  constructor(
    @InjectRepository(ClinicScheduleRule)
    itemsRepository: Repository<ClinicScheduleRule>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
  }
}
