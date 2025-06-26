import { BadRequestException, Injectable } from '@nestjs/common';
import { DoctorRepository } from '../repositories/doctor.repository';
import {
  ActorType,
  applyAuditFields,
  BaseService,
  CreateDoctorAccountDto,
} from '@app/common';
import { Doctor } from '../models/doctor.entity';
import * as bcrypt from 'bcrypt';
import { CommonRepository } from '../repositories/common.repository';
import { StaffInfoRepository } from '../repositories/staffInfo.repository';
import { CreateDoctorProfileDto } from '@app/common/dto/staffs/create-doctor-profile.dto';
import { StaffInfo } from '../models/staffInfo.entity';
import { DoctorClinicMap } from '../models/doctor-clinic-map.entity';

@Injectable()
export class DoctorService extends BaseService {
  constructor(
    private readonly doctorRepository: DoctorRepository,
    private readonly commonRepository: CommonRepository,
    private readonly staffInfoRepository: StaffInfoRepository,
  ) {
    super();
  }

  async viewDoctorAccountList(): Promise<any[]> {
    const doctors = await this.doctorRepository.findAll();

    const enrichedDoctors = await Promise.all(
      doctors.data.map(async (doctor) => {
        const createdBy = await this.commonRepository.findActorWithIdAndType(
          doctor.createdByType,
          doctor.createdById,
        );
        const updatedBy = await this.commonRepository.findActorWithIdAndType(
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

    if (await this.doctorRepository.checkDoctorEmailExists(email)) {
      throw new BadRequestException('A doctor with this email already exists.');
    }

    const doctor = new Doctor();
    doctor.email = email;
    doctor.password = await bcrypt.hash(dto.password, 10);
    if (dto.clinic) {
      const clinicMap = new DoctorClinicMap();
      clinicMap.clinic = dto.clinic; // assign the clinic ID
      clinicMap.doctor = doctor; // establish relation to current doctor

      doctor.clinics = [clinicMap];
    }

    // Add audit fields
    applyAuditFields(doctor, user);

    return await this.doctorRepository.create(doctor);
  }

  async lockDoctorAccount(
    doctorId: string,
    user: { id: string; type: ActorType },
  ) {
    const doctor = await this.doctorRepository.findOne({ id: doctorId });

    if (!doctor) {
      throw new Error(`Doctor with ID ${doctorId} not found`);
    }

    if (doctor.is_locked) {
      return {
        message: `Doctor account ${doctorId} is already locked`,
        doctor,
      };
    }

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

  async unlockDoctorAccount(
    doctorId: string,
    user: { id: string; type: ActorType },
  ) {
    const doctor = await this.doctorRepository.findOne({ id: doctorId });

    if (!doctor) {
      throw new Error(`Doctor with ID ${doctorId} not found`);
    }

    if (!doctor.is_locked) {
      return {
        message: `Doctor account ${doctorId} is already unlocked`,
        doctor,
      };
    }

    const updatedDoctor = await this.doctorRepository.findOneAndUpdate(
      { id: doctorId },
      {
        is_locked: false,
        updatedById: user.id.toString(),
        updatedByType: user.type,
        updatedAt: new Date(),
      },
    );

    return {
      message: `Doctor account ${doctorId} has been unlocked`,
      unlockedBy: user,
      doctor: updatedDoctor,
    };
  }

  async createDoctorProfile(
    payload: CreateDoctorProfileDto,
    user: { id: string; type: ActorType },
  ): Promise<StaffInfo> {
    const staffInfo = new StaffInfo();

    staffInfo.full_name = payload.full_name;
    staffInfo.dob = payload.dob;
    staffInfo.phone = payload.phone;
    staffInfo.gender = payload.gender;
    staffInfo.position = payload.position;

    applyAuditFields(staffInfo, user);

    return await this.staffInfoRepository.create(staffInfo);
  }
  //khanh
  async getDoctorAccountById(
    id: string,
  ): Promise<{ id: string; email: string }> {
    const doctor = await this.doctorRepository.findOne({ id });

    if (!doctor) {
      throw new Error('Doctor not found');
    }

    return {
      id: doctor.id,
      email: doctor.email,
    };
  }
}
