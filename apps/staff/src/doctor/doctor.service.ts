import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IsNull, Like, FindOptionsWhere } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import {
  BaseService,
  CreateDoctorAccountDto,
  DoctorDegreeDto,
  DoctorSpecializeDto,
  DoctorProfileDto,
  setAudit,
  TokenPayload,
  updateAudit,
  UpdateDegreeDto,
  UpdateSpecializeDto,
  UpdateProfileDto,
  deleteAudit,
} from '@app/common';

import { Doctor } from '../models/doctor.entity';
import { StaffInfo } from '../models/staffInfo.entity';
import { Degree } from '../models/degree.entity';
import { Specialize } from '../models/specialize.entity';
import { DoctorClinicMap } from '../models/doctor-clinic-map.entity';

import { DoctorRepository } from '../repositories/doctor.repository';
import { StaffInfoRepository } from '../repositories/staffInfo.repository';
import { DegreeRepository } from '../repositories/degree.repository';
import { SpecializeRepository } from '../repositories/specialize.repository';
import { toDoctorProfile } from '../mapper/doctor-profile.mapper';
import { DoctorClinicRepo } from '../repositories/doctor-clinic-map.repository';
import { ClinicRepository } from '../clinic/clinic.repository';

@Injectable()
export class DoctorService extends BaseService {
  constructor(
    private readonly doctorRepository: DoctorRepository,
    private readonly staffInfoRepository: StaffInfoRepository,
    private readonly degreeRepository: DegreeRepository,
    private readonly specializeRepository: SpecializeRepository,
    private readonly doctorClinicRepo: DoctorClinicRepo,
    private readonly clinicRepository: ClinicRepository,
  ) {
    super();
  }

  async getDoctorAccountList(
    page = 1,
    limit = 10,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    try {
      if (page < 1 || limit < 1) {
        throw new BadRequestException(
          'Page and limit must be positive numbers',
        );
      }

      if (limit > 100) {
        throw new BadRequestException('Limit cannot exceed 100');
      }

      const result = await this.doctorRepository.paginate({
        where: {
          deletedAt: IsNull(),
          deletedById: IsNull(),
          deletedByType: IsNull(),
        },
        relations: ['clinics', 'clinics.clinic'],
        page,
        limit,
      });

      // Map the data to include clinic information
      const mappedData = result.data.map((doctor) => ({
        id: doctor.id,
        email: doctor.email,
        is_locked: doctor.is_locked,
        clinics:
          doctor.clinics?.map((clinicMap) => ({
            id: clinicMap.clinic?.id,
            name: clinicMap.clinic?.name,
            location: clinicMap.clinic?.location,
            phone: clinicMap.clinic?.phone,
            email: clinicMap.clinic?.email,
            ownerId: clinicMap.clinic?.ownerId,
          })) || [],
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt,
      }));

      return {
        data: mappedData,
        total: result.total,
        page,
        limit,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve doctor accounts',
      );
    }
  }

  async getDoctorById(doctorId: string): Promise<any> {
    try {
      if (!doctorId || doctorId.trim() === '') {
        throw new BadRequestException('Doctor ID is required');
      }

      const doctor = await this.doctorRepository.findOne(
        {
          id: doctorId,
          deletedAt: IsNull(),
          deletedById: IsNull(),
          deletedByType: IsNull(),
        },
        ['clinics', 'clinics.clinic'],
      );

      if (!doctor) {
        throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
      }

      return {
        id: doctor.id,
        email: doctor.email,
        is_locked: doctor.is_locked,
        clinics:
          doctor.clinics?.map((clinicMap) => ({
            id: clinicMap.clinic?.id,
            name: clinicMap.clinic?.name,
            location: clinicMap.clinic?.location,
            phone: clinicMap.clinic?.phone,
            email: clinicMap.clinic?.email,
            ownerId: clinicMap.clinic?.ownerId,
          })) || [],
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve doctor');
    }
  }

  async getDoctorListWithProfile(
    page = 1,
    limit = 10,
    search?: string,
    searchField: 'name' | 'email' | 'phone' | 'all' = 'all',
  ): Promise<any> {
    try {
      const baseCondition = {
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      };

      let whereCondition: FindOptionsWhere<Doctor> | FindOptionsWhere<Doctor>[];

      // Add search functionality with field-specific targeting
      if (search?.trim()) {
        const searchTerm = search.trim().toLowerCase();

        if (searchField === 'email') {
          whereCondition = {
            ...baseCondition,
            email: Like(`%${searchTerm}%`),
          };
        } else if (searchField === 'name') {
          whereCondition = {
            ...baseCondition,
            staffInfo: {
              full_name: Like(`%${searchTerm}%`),
            },
          };
        } else if (searchField === 'phone') {
          whereCondition = {
            ...baseCondition,
            staffInfo: {
              phone: Like(`%${searchTerm}%`),
            },
          };
        } else {
          // Default 'all' - search across all fields
          whereCondition = [
            {
              ...baseCondition,
              email: Like(`%${searchTerm}%`),
            },
            {
              ...baseCondition,
              staffInfo: {
                full_name: Like(`%${searchTerm}%`),
              },
            },
            {
              ...baseCondition,
              staffInfo: {
                phone: Like(`%${searchTerm}%`),
              },
            },
          ];
        }
      } else {
        whereCondition = baseCondition;
      }

      const result = await this.doctorRepository.paginate({
        where: whereCondition as FindOptionsWhere<Doctor>,
        relations: ['staffInfo', 'clinics', 'clinics.clinic'],
        page,
        limit,
      });

      // Map the data to exclude audit fields and include only basic info
      const mappedData = result.data.map((doctor) => ({
        id: doctor.id,
        email: doctor.email,
        is_locked: doctor.is_locked,
        clinics:
          doctor.clinics?.map((clinicMap) => ({
            id: clinicMap.clinic?.id,
            name: clinicMap.clinic?.name,
            location: clinicMap.clinic?.location,
            phone: clinicMap.clinic?.phone,
            email: clinicMap.clinic?.email,
            ownerId: clinicMap.clinic?.ownerId,
          })) || [],
        staffInfo: doctor.staffInfo
          ? {
              id: doctor.staffInfo.id,
              staff_id: doctor.staffInfo.staff_id,
              staff_type: doctor.staffInfo.staff_type,
              full_name: doctor.staffInfo.full_name,
              dob: doctor.staffInfo.dob,
              phone: doctor.staffInfo.phone,
              gender: doctor.staffInfo.gender,
              position: doctor.staffInfo.position,
              profile_img_id: doctor.staffInfo.profile_img_id,
            }
          : null,
      }));

      return {
        ...result,
        data: mappedData,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve doctor list with profiles',
      );
    }
  }

  async getClinicsByDoctor(doctorId: string) {
    const doctor = await this.doctorRepository.findOne(
      {
        id: doctorId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      },
      ['clinics', 'clinics.clinic', 'clinics.doctor'], // không cần 'clinics.doctor' nếu không dùng đến
    );
    console.log(doctor);

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // Đảm bảo clinics tồn tại
    const clinicLinks = doctor.clinics.map((clinicMap) => ({
      id: clinicMap.id,
      clinic: {
        id: clinicMap.clinic?.id ?? '',
        name: clinicMap.clinic?.name ?? '',
        location: clinicMap.clinic?.location ?? '',
        phone: clinicMap.clinic?.phone ?? '',
        email: clinicMap.clinic?.email ?? '',
        ownerId: clinicMap.clinic?.ownerId ?? '',
      },
    }));
    console.log(clinicLinks);

    return clinicLinks;
  }

  async doctorJoinClinic(doctorId: string, clinicId: string) {
    const doctor = await this.doctorRepository.findOne({
      id: doctorId,
      deletedAt: IsNull(),
      deletedById: IsNull(),
      deletedByType: IsNull(),
    });

    const clinic = await this.clinicRepository.findOne({
      id: clinicId,
      deletedAt: IsNull(),
      deletedById: IsNull(),
      deletedByType: IsNull(),
    });

    const doctorClinicLink = new DoctorClinicMap({
      clinic: clinic,
      doctor: doctor,
    });

    return this.doctorClinicRepo.save(doctorClinicLink);
  }

  async createDoctorAccount(
    dto: CreateDoctorAccountDto,
    currentUser: TokenPayload,
  ): Promise<Doctor> {
    try {
      const email = dto.email.trim().toLowerCase();

      const emailExists =
        await this.doctorRepository.checkDoctorEmailExists(email);
      if (emailExists) {
        throw new ConflictException(
          `A doctor with email ${email} already exists`,
        );
      }

      const doctor = new Doctor();
      // In case event from other service
      if (dto.id) doctor.id = dto.id;

      doctor.email = email;
      doctor.password = await bcrypt.hash(dto.password, 10);

      if (dto.clinic) {
        const clinicMap = new DoctorClinicMap();
        // clinicMap.clinic = dto.clinic;
        clinicMap.doctor = doctor;
        doctor.clinics = [clinicMap];
      }

      setAudit(doctor, currentUser);

      const createdDoctor = await this.doctorRepository.create(doctor);

      return createdDoctor;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create doctor account');
    }
  }

  async lockDoctorAccount(doctorId: string, currentUser: TokenPayload) {
    try {
      const doctor = await this.doctorRepository.findOne({
        id: doctorId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });
      if (!doctor) {
        throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
      }

      if (doctor.is_locked) {
        throw new ConflictException(
          `Doctor account ${doctorId} is already locked`,
        );
      }

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
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to lock doctor account');
    }
  }

  async unlockDoctorAccount(doctorId: string, currentUser: TokenPayload) {
    try {
      const doctor = await this.doctorRepository.findOne({
        id: doctorId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });
      if (!doctor) {
        throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
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
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to unlock doctor account');
    }
  }

  async getStaffInfoByDoctorId(doctorId: string): Promise<unknown> {
    console.log('[DEBUG] doctorId truyền vào Doctor Service:', doctorId);

    try {
      const doctor = await this.doctorRepository.findOne(
        {
          id: doctorId,
          deletedAt: IsNull(),
          deletedById: IsNull(),
          deletedByType: IsNull(),
        },
        ['clinics', 'clinics.clinic', 'services', 'invitations'],
      );

      console.log('[DEBUG] doctor found:', doctor.email);

      if (!doctor) {
        throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
      }

      const staffInfo = await this.staffInfoRepository.findOne(
        {
          staff_id: doctorId,
          deletedAt: IsNull(),
          deletedById: IsNull(),
          deletedByType: IsNull(),
        },
        ['degrees', 'specializes'],
      );

      const profile = toDoctorProfile(doctor, staffInfo);
      console.log('[DEBUG] doctor profile:', profile);
      return profile;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve staff information',
      );
    }
  }

  async createDoctorProfile(
    staffId: string,
    dto: DoctorProfileDto,
    currentUser: TokenPayload,
  ): Promise<StaffInfo> {
    try {
      const doctor = await this.doctorRepository.findOne({
        id: staffId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });
      if (!doctor) {
        throw new NotFoundException(`Doctor with ID ${staffId} not found`);
      }

      const existingStaffInfo = await this.staffInfoRepository.findOne({
        staff_id: staffId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });
      if (existingStaffInfo) {
        throw new ConflictException(
          `Profile already exists for doctor ${staffId}`,
        );
      }

      if (dto.dob) {
        const dobDate = new Date(dto.dob);
        const now = new Date();
        const age = now.getFullYear() - dobDate.getFullYear();
        if (age < 18 || age > 100) {
          throw new BadRequestException('Age must be between 18 and 100 years');
        }
      }

      const staffInfo = new StaffInfo();
      staffInfo.staff_id = staffId;
      staffInfo.full_name = dto.full_name.trim();
      staffInfo.dob = dto.dob;
      staffInfo.phone = dto.phone.trim();
      staffInfo.gender = dto.gender;
      staffInfo.position = dto.position.trim();
      staffInfo.staff_type = dto.type === 'doctor' ? 'doctor' : 'employee';
      staffInfo.profile_img_id = dto.profile_img_id;

      setAudit(staffInfo, currentUser);

      const createdStaffInfo = await this.staffInfoRepository.create(staffInfo);

      if (dto.type === 'doctor') {
        const updateData = updateAudit(
          { staffInfo: createdStaffInfo },
          currentUser,
        );
        await this.doctorRepository.findOneAndUpdate(
          { id: staffId },
          updateData,
        );
      }

      return createdStaffInfo;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create doctor profile');
    }
  }

  async updateDoctorProfile(
    doctorId: string,
    dto: UpdateProfileDto,
    currentUser: TokenPayload,
  ): Promise<StaffInfo> {
    try {
      const doctor = await this.doctorRepository.findOne({
        id: doctorId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });
      if (!doctor) {
        throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
      }

      const existingStaffInfo = await this.staffInfoRepository.findOne({
        staff_id: doctorId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!existingStaffInfo) {
        throw new NotFoundException(
          `Staff info not found for doctor ${doctorId}`,
        );
      }

      if (dto.dob) {
        const dobDate = new Date(dto.dob);
        const now = new Date();
        const age = now.getFullYear() - dobDate.getFullYear();
        if (age < 18 || age > 100) {
          throw new BadRequestException('Age must be between 18 and 100 years');
        }
      }

      const updatedFields: QueryDeepPartialEntity<StaffInfo> = {
        full_name: dto.full_name.trim(),
        dob: dto.dob,
        phone: dto.phone.trim(),
        gender: dto.gender,
        position: dto.position.trim(),
        profile_img_id: dto.profile_img_id,
        staff_type: existingStaffInfo.staff_type,
      };

      updateAudit(updatedFields, currentUser);

      const updatedStaffInfo = await this.staffInfoRepository.findOneAndUpdate(
        { id: existingStaffInfo.id },
        updatedFields,
      );

      return updatedStaffInfo;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update doctor profile');
    }
  }

  async getDegreeList(doctorId: string): Promise<Degree[]> {
    try {
      const staff = await this.staffInfoRepository.findOne({
        staff_id: doctorId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!staff) {
        throw new NotFoundException(
          `Staff info not found for doctor ${doctorId}`,
        );
      }

      const degrees = await this.degreeRepository.find({
        staff_info: { id: staff.id },
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      return degrees;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve degrees');
    }
  }

  getDoctorsByIds(data: { ids: number[] }) {
    console.log(
      'This is a mock response from Doctor Service, received IDs:',
      data.ids,
    );

    const formatData = data.ids.map((id) => ({
      name: `Doctor ${id}`,
      email: `doctor${id}@example.com`,
    }));

    console.log('Formatted doctor mock data:', formatData);

    return formatData;
  }

  async addDoctorDegree(
    doctorId: string,
    dto: DoctorDegreeDto,
    currentUser: TokenPayload,
  ): Promise<Degree> {
    try {
      const staff = await this.staffInfoRepository.findOne({
        staff_id: doctorId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!staff) {
        throw new NotFoundException(
          `Staff info not found for doctor ${doctorId}`,
        );
      }

      const existingDegrees = await this.degreeRepository.find({
        staff_info: { id: staff.id },
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      const duplicateDegree = existingDegrees.find(
        (degree) => degree.name.toLowerCase() === dto.name.trim().toLowerCase(),
      );

      if (duplicateDegree) {
        throw new ConflictException(
          `Degree with name "${dto.name}" already exists for this doctor`,
        );
      }

      const degree = new Degree();
      degree.name = dto.name.trim();
      degree.description = dto.description.trim();
      degree.image_id = dto.image_id;
      degree.staff_info = staff;

      setAudit(degree, currentUser);

      const createdDegree = await this.degreeRepository.create(degree);

      return createdDegree;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add degree');
    }
  }

  async updateDoctorDegree(
    doctorId: string,
    degreeId: string,
    dto: UpdateDegreeDto,
    currentUser: TokenPayload,
  ): Promise<Degree> {
    try {
      const staff = await this.staffInfoRepository.findOne({
        staff_id: doctorId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!staff) {
        throw new NotFoundException(
          `Staff info not found for doctor ${doctorId}`,
        );
      }

      const existingDegree = await this.degreeRepository.findOne({
        id: degreeId,
        staff_info: { id: staff.id },
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!existingDegree) {
        throw new NotFoundException(
          `Degree with ID ${degreeId} not found for doctor ${doctorId}`,
        );
      }

      const otherDegrees = await this.degreeRepository.find({
        staff_info: { id: staff.id },
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      const duplicateDegree = otherDegrees.find(
        (degree) =>
          degree.id !== degreeId &&
          degree.name.toLowerCase() === dto.name?.trim().toLowerCase(),
      );

      if (duplicateDegree) {
        throw new ConflictException(
          `Another degree with name "${dto.name}" already exists for this doctor`,
        );
      }

      const updatedFields: QueryDeepPartialEntity<Degree> = {
        name: dto.name?.trim(),
        description: dto.description?.trim(),
        image_id: dto.image_id,
        staff_info: staff,
      };

      updateAudit(updatedFields, currentUser);

      const updatedDegree = await this.degreeRepository.findOneAndUpdate(
        { id: degreeId },
        updatedFields,
      );

      return updatedDegree;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update degree');
    }
  }

  async deleteDoctorDegree(
    doctorId: string,
    degreeId: string,
    currentUser: TokenPayload,
  ): Promise<void> {
    try {
      const staff = await this.staffInfoRepository.findOne({
        staff_id: doctorId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!staff) {
        throw new NotFoundException(
          `Staff info not found for doctor ${doctorId}`,
        );
      }

      const degree = await this.degreeRepository.findOne(
        {
          id: degreeId,
          staff_info: { staff_id: doctorId },
          deletedAt: IsNull(),
          deletedById: IsNull(),
          deletedByType: IsNull(),
        },
        ['staff_info'],
      );

      if (!degree) {
        throw new NotFoundException(
          `Degree with ID ${degreeId} not found for doctor ${doctorId}`,
        );
      }

      const updateData = deleteAudit({}, currentUser);
      await this.degreeRepository.findOneAndUpdate(
        { id: degreeId },
        updateData,
      );
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete degree');
    }
  }

  async getSpecializeList(doctorId: string): Promise<Specialize[]> {
    try {
      const staff = await this.staffInfoRepository.findOne({
        staff_id: doctorId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!staff) {
        throw new NotFoundException(
          `Staff info not found for doctor ${doctorId}`,
        );
      }

      const specializes = await this.specializeRepository.find({
        staff_info: { id: staff.id },
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      return specializes;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve specializations',
      );
    }
  }

  async addDoctorSpecialize(
    doctorId: string,
    dto: DoctorSpecializeDto,
    currentUser: TokenPayload,
  ): Promise<Specialize> {
    try {
      const staff = await this.staffInfoRepository.findOne({
        staff_id: doctorId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!staff) {
        throw new NotFoundException(
          `Staff info not found for doctor ${doctorId}`,
        );
      }

      const existingSpecializations = await this.specializeRepository.find({
        staff_info: { id: staff.id },
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      const duplicateSpecialization = existingSpecializations.find(
        (spec) => spec.name.toLowerCase() === dto.name?.trim().toLowerCase(),
      );

      if (duplicateSpecialization) {
        throw new ConflictException(
          `Specialization with name "${dto.name}" already exists for this doctor`,
        );
      }

      const specialize = new Specialize();
      specialize.name = dto.name.trim();
      specialize.description = dto.description.trim();
      specialize.image_id = dto.image_id;
      specialize.staff_info = staff;

      setAudit(specialize, currentUser);

      const createdSpecialize =
        await this.specializeRepository.create(specialize);

      return createdSpecialize;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to add specialization');
    }
  }

  async updateDoctorSpecialize(
    doctorId: string,
    specializeId: string,
    dto: UpdateSpecializeDto,
    currentUser: TokenPayload,
  ): Promise<Specialize> {
    try {
      const staff = await this.staffInfoRepository.findOne({
        staff_id: doctorId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!staff) {
        throw new NotFoundException(
          `Staff info not found for doctor ${doctorId}`,
        );
      }

      const existingSpecialize = await this.specializeRepository.findOne({
        id: specializeId,
        staff_info: { id: staff.id },
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!existingSpecialize) {
        throw new NotFoundException(
          `Specialization with ID ${specializeId} not found for doctor ${doctorId}`,
        );
      }

      const otherSpecializations = await this.specializeRepository.find({
        staff_info: { id: staff.id },
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      const duplicateSpecialization = otherSpecializations.find(
        (spec) =>
          spec.id !== specializeId &&
          spec.name.toLowerCase() === dto.name?.trim().toLowerCase(),
      );

      if (duplicateSpecialization) {
        throw new ConflictException(
          `Another specialization with name "${dto.name}" already exists for this doctor`,
        );
      }

      const updatedFields: QueryDeepPartialEntity<Specialize> = {
        name: dto.name?.trim(),
        description: dto.description?.trim(),
        image_id: dto.image_id,
        staff_info: staff,
      };

      updateAudit(updatedFields, currentUser);

      const updatedSpecialize =
        await this.specializeRepository.findOneAndUpdate(
          { id: specializeId },
          updatedFields,
        );

      return updatedSpecialize;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update specialization');
    }
  }

  async deleteDoctorSpecialize(
    doctorId: string,
    specializeId: string,
    currentUser: TokenPayload,
  ): Promise<void> {
    try {
      const staff = await this.staffInfoRepository.findOne({
        staff_id: doctorId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!staff) {
        throw new NotFoundException(
          `Staff info not found for doctor ${doctorId}`,
        );
      }

      const specialize = await this.specializeRepository.findOne({
        id: specializeId,
        staff_info: { id: staff.id },
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!specialize) {
        throw new NotFoundException(
          `Specialization with ID ${specializeId} not found for doctor ${doctorId}`,
        );
      }

      const updateData = deleteAudit({}, currentUser);
      await this.specializeRepository.findOneAndUpdate(
        { id: specializeId },
        updateData,
      );
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete specialization');
    }
  }
  // async createDoctorProfileStepTwo(
  //   payload: any,
  //   user: { id: string; type: ActorType },
  // ): Promise<StaffInfo> {
  //   const staffInfo = await this.staffInfoRepository.findOne({});
  //   return null;
  // }

  //khanh
  async getDoctorByClinic(clinicId: string): Promise<any[]> {
    // Query doctor theo clinicId
    const doctorClinicMaps = await this.doctorRepository.repo.manager
      .getRepository(DoctorClinicMap)
      .createQueryBuilder('doctorClinicMap')
      .innerJoinAndSelect('doctorClinicMap.doctor', 'doctor')
      .innerJoinAndSelect('doctorClinicMap.clinic', 'clinic')
      .where('doctorClinicMap.clinic = :clinicId', { clinicId })
      .getMany();

    const doctors = doctorClinicMaps.map((map) => map.doctor);

    // Lặp từng doctor để lấy info
    const results = await Promise.all(
      doctorClinicMaps.map(async (map) => {
        const doctor = map.doctor;
        const clinic = map.clinic;

        const staffInfo = await this.staffInfoRepository.findOne(
          {
            staff_id: doctor.id,
            deletedAt: IsNull(),
            deletedById: IsNull(),
            deletedByType: IsNull(),
          },
          ['degrees', 'specializes'],
        );

        return {
          account: {
            id: doctor.id,
            email: doctor.email,
            clinic: clinic
              ? {
                  id: clinic.id,
                  name: clinic.name,
                  location: clinic.location,
                  phone: clinic.phone,
                  email: clinic.email,
                  ownerId: clinic.ownerId,
                }
              : null,
          },
          info: staffInfo || null,
          examFee: map.examFee ?? null, // <-- thêm dòng này để trả về giá khám
        };
      }),
    );

    return results;
  }

  async getDoctorAccountById(
    id: string,
  ): Promise<{ id: string; email: string; clinics: any[] }> {
    console.log('Fetching doctor account by ID:', id);
    const doctor = await this.doctorRepository.findOne(
      {
        id,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      },
      ['clinics', 'clinics.clinic'],
    );
    console.log('Doctor found:', doctor);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    return {
      id: doctor.id,
      email: doctor.email,
      clinics:
        doctor.clinics?.map((clinicMap) => ({
          id: clinicMap.clinic?.id,
          name: clinicMap.clinic?.name,
          location: clinicMap.clinic?.location,
          phone: clinicMap.clinic?.phone,
          email: clinicMap.clinic?.email,
          ownerId: clinicMap.clinic?.ownerId,
        })) || [],
    };
  }

  // ============================================================================
  // DOCTOR CLINIC ASSIGNMENT
  // ============================================================================

  async assignDoctorToClinic(
    doctorId: string,
    clinicId: string,
    currentUser: TokenPayload,
  ): Promise<{ message: string; assignment: DoctorClinicMap }> {
    try {
      // Validate doctor exists
      const doctor = await this.doctorRepository.findOne({
        id: doctorId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!doctor) {
        throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
      }

      const clinic = await this.clinicRepository.findOne({
        id: clinicId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      // Check if assignment already exists
      const existingAssignment = await this.doctorClinicRepo.findOne({
        doctor: { id: doctorId },
        clinic,
      });

      if (existingAssignment) {
        throw new ConflictException(
          `Doctor ${doctorId} is already assigned to clinic ${clinicId}`,
        );
      }

      // Create new clinic assignment
      const doctorClinicLink = new DoctorClinicMap({
        clinic: clinic,
        doctor: doctor,
      });

      setAudit(doctorClinicLink, currentUser);

      const savedAssignment =
        await this.doctorClinicRepo.save(doctorClinicLink);

      return {
        message: `Doctor ${doctorId} successfully assigned to clinic ${clinicId}`,
        assignment: savedAssignment,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to assign doctor to clinic',
      );
    }
  }

  async removeDoctorFromClinic(
    doctorId: string,
    clinicId: string,
  ): Promise<{ message: string }> {
    try {
      // Validate doctor exists
      const doctor = await this.doctorRepository.findOne({
        id: doctorId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!doctor) {
        throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
      }

      const clinic = await this.clinicRepository.findOne({
        id: clinicId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      // Find the assignment
      const assignment = await this.doctorClinicRepo.findOne({
        doctor: { id: doctorId },
        clinic: clinic,
      });

      if (!assignment) {
        throw new NotFoundException(
          `Doctor ${doctorId} is not assigned to clinic ${clinicId}`,
        );
      }

      // Remove the assignment
      await this.doctorClinicRepo.deleteLink(assignment.id);

      return {
        message: `Doctor ${doctorId} successfully removed from clinic ${clinicId}`,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to remove doctor from clinic',
      );
    }
  }
}
