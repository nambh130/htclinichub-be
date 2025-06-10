import { Injectable } from '@nestjs/common';
import { DoctorRepository } from '../repositories/doctor.repository';
import {
  ActorType,
  applyAuditFields,
  BaseService,
  CreateDoctorAccountDto,
} from '@app/common';
import { Doctor } from '../models/doctor.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DoctorService extends BaseService {
  constructor(private readonly doctorRepository: DoctorRepository) {
    super();
  }

  async viewDoctorAccountList(): Promise<any[]> {
    const doctors = await this.doctorRepository.findAll();

    const enrichedDoctors = await Promise.all(
      doctors.map(async (doctor) => {
        const createdBy = await this.doctorRepository.findActorWithIdAndType(
          doctor.createdByType,
          doctor.createdById,
        );
        const updatedBy = await this.doctorRepository.findActorWithIdAndType(
          doctor.updatedByType,
          doctor.updatedById,
        );

        const {
          createdById: _createdById,
          createdByType: _createdByType,
          updatedById: _updatedById,
          updatedByType: _updatedByType,
          password: _password,
          ...rest
        } = doctor;

        return {
          ...rest,
          createdBy,
          updatedBy,
        };
      }),
    );

    return enrichedDoctors;
  }

  async createDoctorAccount(
    dto: CreateDoctorAccountDto,
    user: { id: string; type: ActorType },
  ): Promise<Doctor> {
    const email = dto.email.trim().toLowerCase();
    const doctor = new Doctor();
    doctor.email = email;
    doctor.password = await bcrypt.hash(dto.password, 10);

    // Add audit fields
    applyAuditFields(doctor, user);

    return await this.doctorRepository.create(doctor);
  }

  async lockDoctorAccount(
    doctorId: string,
    user: { id: string; type: ActorType },
  ) {
    const updatedDoctor = await this.doctorRepository.findOneAndUpdate(
      { id: doctorId },
      {
        is_locked: true,
        updatedById: user.id.toString(),
        updatedByType: user.type,
        updatedAt: new Date(),
      },
    );

    return {
      message: `Doctor account ${doctorId} has been locked`,
      lockedBy: user,
      doctor: updatedDoctor,
    };
  }
}
