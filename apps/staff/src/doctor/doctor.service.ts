import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  BaseService,
  CreateDoctorAccountDto,
  DoctorDegreeDto,
  DoctorSpecializeDto,
  DoctorStepOneDto,
  setAudit,
  TokenPayload,
  updateAudit,
} from '@app/common';
import { Doctor } from '../models/doctor.entity';
import { StaffInfo } from '../models/staffInfo.entity';
import { DoctorRepository } from '../repositories/doctor.repository';
import { StaffInfoRepository } from '../repositories/staffInfo.repository';
import { IsNull } from 'typeorm';
import { Degree } from '../models/degree.entity';
import { DegreeRepository } from '../repositories/degree.repository';
import { SpecializeRepository } from '../repositories/specialize.repository';
import { Specialize } from '../models/specialize.entity';
import { DoctorClinicMap } from '../models/doctor-clinic-map.entity';
import { toDoctorProfile } from '../mapper/doctor-profile.mapper';

@Injectable()
export class DoctorService extends BaseService {
  constructor(
    private readonly doctorRepository: DoctorRepository,
    private readonly staffInfoRepository: StaffInfoRepository,
    private readonly degreeRepository: DegreeRepository,
    private readonly specializeRepository: SpecializeRepository,
  ) {
    super();
  }

  async getDoctorAccountList(
    page = 1,
    limit = 10,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    return this.doctorRepository.paginate({
      where: {
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      },
      page,
      limit,
    });
  }

  async getDoctorById(doctorId: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({ id: doctorId });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async createDoctorAccount(
    dto: CreateDoctorAccountDto,
    currentUser: TokenPayload,
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
      clinicMap.clinic = { id: dto.clinic } as any; // gán tạm entity với id
      clinicMap.doctor = doctor;

      doctor.clinics = [clinicMap];
    }

    setAudit(doctor, currentUser);

    return await this.doctorRepository.create(doctor);
  }

  async lockDoctorAccount(doctorId: string, currentUser: TokenPayload) {
    const updateData = updateAudit({ is_locked: true }, currentUser);

    const updatedDoctor = await this.doctorRepository.findOneAndUpdate(
      { id: doctorId },
      updateData,
    );

    return {
      message: `Doctor account ${doctorId} has been locked`,
      lockedBy: currentUser,
      doctor: updatedDoctor,
    };
  }

  async unlockDoctorAccount(doctorId: string, currentUser: TokenPayload) {
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

    const updateData = updateAudit({ is_locked: false }, currentUser);

    const updatedDoctor = await this.doctorRepository.findOneAndUpdate(
      { id: doctorId },
      updateData,
    );

    return {
      message: `Doctor account ${doctorId} has been unlocked`,
      unlockedBy: currentUser,
      doctor: updatedDoctor,
    };
  }

  async getStaffInfoByDoctorId(doctorId: string): Promise<unknown> {
    const doctor = await this.doctorRepository.findOne({ id: doctorId }, [
      'clinics',
      'services',
      'invitations',
    ]);

    const staffInfo = await this.staffInfoRepository.findOne(
      { staff_id: doctorId },
      ['degrees', 'specializes'],
    );

    return toDoctorProfile(doctor, staffInfo);
  }

  async createDoctorProfileStepOne(
    staffId: string,
    dto: DoctorStepOneDto,
    currentUser: TokenPayload,
  ): Promise<StaffInfo> {
    const staffInfo = new StaffInfo();
    staffInfo.staff_id = staffId;
    staffInfo.full_name = dto.full_name;
    staffInfo.dob = dto.dob;
    staffInfo.phone = dto.phone;
    staffInfo.gender = dto.gender;
    staffInfo.position = dto.position;
    staffInfo.staff_type = dto.type === 'doctor' ? 'doctor' : 'employee';

    setAudit(staffInfo, currentUser);

    const createdStaffInfo = await this.staffInfoRepository.create(staffInfo);

    if (dto.type === 'doctor') {
      const doctor = await this.doctorRepository.findOne({ id: staffId });

      updateAudit(doctor, currentUser);
      doctor.staffInfo = createdStaffInfo;

      await this.doctorRepository.findOneAndUpdate({ id: staffId }, doctor);
    }

    return createdStaffInfo;
  }

  async addDoctorDegree(
    staffInfoId: string,
    dto: DoctorDegreeDto,
    currentUser: TokenPayload,
  ): Promise<Degree> {
    const staff = await this.staffInfoRepository.findOne({ id: staffInfoId });

    const degree = new Degree();
    degree.name = dto.name;
    degree.description = dto.description;
    degree.image_id = dto.image_id;
    degree.staff_info = staff;

    setAudit(degree, currentUser);

    return await this.degreeRepository.create(degree);
  }

  async getDegreeList(staffInfoId: string): Promise<Degree[]> {
    const degrees = await this.degreeRepository.find({
      staff_info: { id: staffInfoId },
    });

    return degrees;
  }

  async addDoctorSpecialize(
    staffInfoId: string,
    dto: DoctorSpecializeDto,
    currentUser: TokenPayload,
  ): Promise<Specialize> {
    const staff = await this.staffInfoRepository.findOne({ id: staffInfoId });

    const specialize = new Specialize();
    specialize.name = dto.name;
    specialize.description = dto.description;
    specialize.image_id = dto.image_id;
    specialize.staff_info = staff;

    setAudit(specialize, currentUser);

    return await this.staffInfoRepository.create(staffInfo);
  }
  //khanh
  async getDoctorAccountById(
    id: string,
  ): Promise<{ id: string; email: string }> {
    console.log('Fetching doctor account by ID:', id);
    const doctor = await this.doctorRepository.findOne({ id });
    console.log('Doctor found:', doctor);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    return {
      id: doctor.id,
      email: doctor.email,
    };
  }

  async getDoctorByClinic(clinicId: string): Promise<any[]> {
    const doctors = await this.doctorRepository.repo
      .createQueryBuilder('doctor')
      .innerJoin('doctor.clinics', 'doctorClinicMap')
      .leftJoinAndSelect('doctor.staff_info', 'staff_info')
      .where('doctorClinicMap.clinic = :clinicId', { clinicId })
      .getMany();

    if (!doctors || doctors.length === 0) {
      throw new Error(`No doctors found for clinic ID ${clinicId}`);
    }

    return doctors.map((doctor) => ({
      account: {
        id: doctor.id,
        email: doctor.email,
      },
      info: doctor.staff_info || null,
    }));
  }
}
