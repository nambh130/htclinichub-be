import { BaseClinicService } from '@app/common/modules/clinic/base-clinics.service';
import { Injectable } from '@nestjs/common';
import { ClinicRepository } from './clinic.repository';
import { Clinic } from '../models/clinic.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorClinicMap } from '../models/doctor-clinic-map.entity';

@Injectable()
export class ClinicService extends BaseClinicService<Clinic> {
  constructor(
    private readonly clinicRepo: ClinicRepository,
    @InjectRepository(DoctorClinicMap)
    private readonly doctorClinicMapRepo: Repository<DoctorClinicMap>,
  ) {
    super(clinicRepo);
  }

  async create(data: { name: string; location: string }) {
    return await this.clinicRepo.create(
      new Clinic({ name: data.name, location: data.location }),
    );
  }

  async save(clinicData: Partial<Clinic>) {
    return await this.clinicRepo.create(new Clinic(clinicData));
  }

  async addClinic(clinicData: Partial<Clinic>) {
    const clinic = new Clinic(clinicData);
    const createdClinic = await this.clinicRepo.create(clinic);

    if (createdClinic.ownerId) {
      // Create doctor-clinic mapping using the correct entity relationship approach
      const map = this.doctorClinicMapRepo.create({
        doctor: { id: createdClinic.ownerId },
        clinic: { id: createdClinic.id }, // 👈 truyền object
      });
      await this.doctorClinicMapRepo.save(map);
    }

    return createdClinic;
  }

  // async getClinicById(clinicId: string): Promise<Clinic | null> {
  //   return this.clinicRepo.findOne({ where: { id: clinicId } });
  // }
}
