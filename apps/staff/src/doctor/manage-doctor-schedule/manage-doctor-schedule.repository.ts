import { Injectable, Logger } from '@nestjs/common';
import { PostgresAbstractRepository } from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, In } from 'typeorm';
import { Doctor_WorkShift } from '../../models/doctor_workshift.entity';

@Injectable()
export class ManageDoctorScheduleRepository extends PostgresAbstractRepository<Doctor_WorkShift> {
  protected readonly logger = new Logger(ManageDoctorScheduleRepository.name);


  constructor(
    @InjectRepository(Doctor_WorkShift)
    itemsRepository: Repository<Doctor_WorkShift>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
  }
}
