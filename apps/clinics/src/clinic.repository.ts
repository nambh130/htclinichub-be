import { Injectable, Logger } from '@nestjs/common';
import { Clinic } from './models/clinics.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractTypeOrmRepository } from '@app/common/database/abstract.typeorm.repository';

@Injectable()
export class ClinicRepository extends AbstractTypeOrmRepository<Clinic> {
  protected readonly logger = new Logger(ClinicRepository.name);

  constructor(
    @InjectRepository(Clinic)
    clinicRepository: Repository<Clinic>,
  ) {
    super(clinicRepository);
  }
}
