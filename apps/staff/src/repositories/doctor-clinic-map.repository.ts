import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { DoctorClinicMap } from '../models/doctor-clinic-map.entity';

@Injectable()
export class DoctorClinicRepo {
  protected readonly logger = new Logger(DoctorClinicRepo.name);

  constructor(
    @InjectRepository(DoctorClinicMap)
    private readonly itemsRepository: Repository<DoctorClinicMap>,
    private readonly entityManager: EntityManager,
  ) { }

  async saveLink(link: DoctorClinicMap) {
    return await this.itemsRepository.save(link);
  }

}

