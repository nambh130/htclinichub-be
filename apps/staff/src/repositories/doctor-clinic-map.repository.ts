import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { DoctorClinicMap } from '../models/doctor-clinic-map.entity';

@Injectable()
export class DoctorClinicRepo {
  protected readonly logger = new Logger(DoctorClinicRepo.name);

  constructor(
    @InjectRepository(DoctorClinicMap)
    private readonly itemsRepository: Repository<DoctorClinicMap>,
    private readonly entityManager: EntityManager,
  ) {}

  async saveLink(link: DoctorClinicMap) {
    return await this.itemsRepository.save(link);
  }

  async findLinkByDoctorAndClinic(
    doctor_clinic_link_id: string,
  ): Promise<DoctorClinicMap | null> {
    return await this.itemsRepository.findOne({
      where: { id: doctor_clinic_link_id },
      relations: {
        doctor: true,
        clinic: true,
      },
    });
  }
  async findOne(where: FindOptionsWhere<DoctorClinicMap>) {
    return await this.itemsRepository.findOne({ where });
  }
}
