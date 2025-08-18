import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IsNull, Like, In, FindOptionsWhere, Not } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import {
  BaseService,
  CreateEmployeeAccountDto,
  EmployeeDegreeDto,
  EmployeeSpecializeDto,
  EmployeeProfileDto,
  setAudit,
  TokenPayload,
  updateAudit,
  UpdateDegreeDto,
  UpdateSpecializeDto,
  UpdateProfileDto,
  deleteAudit,
} from '@app/common';

import { Employee } from '../models/employee.entity';
import { StaffInfo } from '../models/staffInfo.entity';
import { Degree } from '../models/degree.entity';
import { Specialize } from '../models/specialize.entity';

import { EmployeeRepository } from '../repositories/employee.repository';
import { StaffInfoRepository } from '../repositories/staffInfo.repository';
import { DegreeRepository } from '../repositories/degree.repository';
import { SpecializeRepository } from '../repositories/specialize.repository';
import { ClinicRepository } from '../clinic/clinic.repository';

@Injectable()
export class EmployeeService extends BaseService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly staffInfoRepository: StaffInfoRepository,
    private readonly degreeRepository: DegreeRepository,
    private readonly specializeRepository: SpecializeRepository,
    private readonly clinicRepository: ClinicRepository,
  ) {
    super();
  }

  async getEmployeeAccountList(
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

      const result = await this.employeeRepository.paginate({
        where: {
          deletedAt: IsNull(),
          deletedById: IsNull(),
          deletedByType: IsNull(),
        },
        page,
        limit,
      });

      if (!result.data.length) {
        return { data: [], total: 0, page, limit };
      }

      // Get unique clinic IDs and fetch clinic information
      const clinicIds = [...new Set(result.data.map((emp) => emp.clinic_id))];
      const clinics = await this.clinicRepository.find({
        id: In(clinicIds),
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });
      const clinicMap = new Map(clinics.map((clinic) => [clinic.id, clinic]));

      // Map employee data with clinic information
      const mappedData = result.data.map((employee) => {
        const clinic = clinicMap.get(employee.clinic_id);
        return {
          id: employee.id,
          email: employee.email,
          is_locked: employee.is_locked,
          clinic_id: employee.clinic_id,
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
          createdAt: employee.createdAt,
          updatedAt: employee.updatedAt,
        };
      });

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
        'Failed to retrieve employee accounts',
      );
    }
  }

  async getEmployeeById(employeeId: string): Promise<any> {
    try {
      if (!employeeId || employeeId.trim() === '') {
        throw new BadRequestException('Employee ID is required');
      }

      const employee = await this.employeeRepository.findOne({
        id: employeeId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!employee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }

      // Fetch clinic information
      const clinic = await this.clinicRepository.findOne({
        id: employee.clinic_id,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      return {
        id: employee.id,
        email: employee.email,
        is_locked: employee.is_locked,
        clinic_id: employee.clinic_id,
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
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve employee');
    }
  }

  async getEmployeeListWithProfile(
    page = 1,
    limit = 10,
    search?: string,
    searchField: 'name' | 'email' | 'phone' | 'all' = 'all',
    clinicId?: string,
  ): Promise<any> {
    try {
      const baseCondition = {
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      };
      const searchTerm = search?.trim().toLowerCase();

      let employeeWhere: FindOptionsWhere<Employee> = baseCondition;
      if (clinicId) {
        employeeWhere = { ...employeeWhere, clinic_id: clinicId };
      }
      if (searchTerm && searchField === 'email') {
        employeeWhere = { ...employeeWhere, email: Like(`%${searchTerm}%`) };
      }

      const result = await this.employeeRepository.paginate({
        where: employeeWhere,
        page,
        limit,
      });
      if (!result.data.length) return { data: [], total: 0, page, limit };

      const employeeIds = result.data.map((emp) => emp.id);
      const clinicIds = [...new Set(result.data.map((emp) => emp.clinic_id))];

      const staffInfos = await this.staffInfoRepository.find({
        staff_id: In(employeeIds),
        ...baseCondition,
      });
      const staffMap = new Map(
        staffInfos.map((staff) => [staff.staff_id, staff]),
      );

      const clinics = await this.clinicRepository.find({
        id: In(clinicIds),
        ...baseCondition,
      });
      const clinicMap = new Map(clinics.map((clinic) => [clinic.id, clinic]));

      const shouldFilter =
        searchTerm && ['name', 'phone', 'all'].includes(searchField);
      const filteredEmployees = shouldFilter
        ? result.data.filter((emp) => {
            const staff = staffMap.get(emp.id);
            return searchField === 'name'
              ? staff?.full_name?.toLowerCase().includes(searchTerm)
              : searchField === 'phone'
                ? staff?.phone?.includes(searchTerm)
                : emp.email.toLowerCase().includes(searchTerm) ||
                  staff?.full_name?.toLowerCase().includes(searchTerm) ||
                  staff?.phone?.includes(searchTerm);
          })
        : result.data;

      const mappedData = filteredEmployees.map((emp) => {
        const staff = staffMap.get(emp.id);
        const clinic = clinicMap.get(emp.clinic_id);
        return {
          id: emp.id,
          email: emp.email,
          is_locked: emp.is_locked,
          clinic_id: emp.clinic_id,
          staffInfo: staff
            ? {
                id: staff.id,
                staff_id: staff.staff_id,
                staff_type: staff.staff_type,
                full_name: staff.full_name,
                social_id: staff.social_id,
                dob: staff.dob,
                phone: staff.phone,
                gender: staff.gender,
                position: staff.position,
                profile_img_id: staff.profile_img_id,
              }
            : null,
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
        };
      });

      return {
        data: mappedData,
        total: shouldFilter ? filteredEmployees.length : result.total,
        page,
        limit,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve employee list with profiles',
      );
    }
  }

  async createEmployeeAccount(
    dto: CreateEmployeeAccountDto,
    currentUser: TokenPayload,
  ): Promise<Employee> {
    try {
      const email = dto.email.trim().toLowerCase();

      const emailExists =
        await this.employeeRepository.checkEmployeeEmailExists(email);
      if (emailExists) {
        throw new ConflictException(
          `An employee with email ${email} already exists`,
        );
      }

      const employee = new Employee();
      // In case event from other service
      if (dto.id) employee.id = dto.id;
      employee.email = email;
      employee.password = await bcrypt.hash(dto.password, 10);
      employee.clinic_id = dto.clinic_id;

      setAudit(employee, currentUser);

      const createdEmployee = await this.employeeRepository.create(employee);

      return createdEmployee;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create employee account',
      );
    }
  }

  async lockEmployeeAccount(employeeId: string, currentUser: TokenPayload) {
    try {
      const employee = await this.employeeRepository.findOne({
        id: employeeId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }

      if (employee.is_locked) {
        throw new ConflictException(
          `Employee account ${employeeId} is already locked`,
        );
      }

      const updateData = updateAudit({ is_locked: true }, currentUser);
      const updatedEmployee = await this.employeeRepository.findOneAndUpdate(
        { id: employeeId },
        updateData,
      );

      return {
        message: `Employee account ${employeeId} has been locked`,
        lockedBy: currentUser,
        employee: updatedEmployee,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to lock employee account');
    }
  }

  async unlockEmployeeAccount(employeeId: string, currentUser: TokenPayload) {
    try {
      const employee = await this.employeeRepository.findOne({
        id: employeeId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }

      if (!employee.is_locked) {
        return {
          message: `Employee account ${employeeId} is already unlocked`,
          employee,
        };
      }

      const updateData = updateAudit({ is_locked: false }, currentUser);
      const updatedEmployee = await this.employeeRepository.findOneAndUpdate(
        { id: employeeId },
        updateData,
      );

      return {
        message: `Employee account ${employeeId} has been unlocked`,
        unlockedBy: currentUser,
        employee: updatedEmployee,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to unlock employee account',
      );
    }
  }

  async getStaffInfoByEmployeeId(employeeId: string): Promise<unknown> {
    try {
      const employee = await this.employeeRepository.findOne(
        {
          id: employeeId,
          deletedAt: IsNull(),
          deletedById: IsNull(),
          deletedByType: IsNull(),
        },
        [],
      );

      if (!employee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }

      const staffInfo = await this.staffInfoRepository.findOne(
        {
          staff_id: employeeId,
          deletedAt: IsNull(),
          deletedById: IsNull(),
          deletedByType: IsNull(),
        },
        ['degrees', 'specializes'],
      );

      // Fetch clinic information
      const clinic = await this.clinicRepository.findOne({
        id: employee.clinic_id,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      const profile = {
        account: {
          id: employee.id,
          email: employee.email,
          clinic_id: employee.clinic_id,
          is_locked: employee.is_locked,
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
          staffInfo: staffInfo,
        },
        staffInfo: staffInfo,
      };

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

  async createEmployeeProfile(
    staffId: string,
    dto: EmployeeProfileDto,
    currentUser: TokenPayload,
  ): Promise<StaffInfo> {
    try {
      const employee = await this.employeeRepository.findOne({
        id: staffId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${staffId} not found`);
      }

      const existingStaffInfo = await this.staffInfoRepository.findOne({
        staff_id: staffId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });
      if (existingStaffInfo) {
        throw new ConflictException(
          `Profile already exists for employee ${staffId}`,
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

      // Check if social_id is unique if provided
      if (dto.social_id) {
        const existingStaffWithSocialId =
          await this.staffInfoRepository.findOne({
            social_id: dto.social_id.trim(),
            deletedAt: IsNull(),
            deletedById: IsNull(),
            deletedByType: IsNull(),
          });
        if (existingStaffWithSocialId) {
          throw new ConflictException(
            `Staff with social ID ${dto.social_id} already exists`,
          );
        }
      }

      const staffInfo = new StaffInfo();
      staffInfo.staff_id = staffId;
      staffInfo.full_name = dto.full_name.trim();
      staffInfo.social_id = dto.social_id?.trim() || null;
      staffInfo.dob = dto.dob;
      staffInfo.phone = dto.phone.trim();
      staffInfo.gender = dto.gender;
      staffInfo.position = dto.position.trim();
      staffInfo.staff_type = dto.type === 'employee' ? 'employee' : 'employee';
      staffInfo.profile_img_id = dto.profile_img_id;

      setAudit(staffInfo, currentUser);

      const createdStaffInfo = await this.staffInfoRepository.create(staffInfo);

      return createdStaffInfo;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create employee profile',
      );
    }
  }

  async updateEmployeeProfile(
    employeeId: string,
    dto: UpdateProfileDto,
    currentUser: TokenPayload,
  ): Promise<StaffInfo> {
    try {
      const employee = await this.employeeRepository.findOne({
        id: employeeId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }

      const existingStaffInfo = await this.staffInfoRepository.findOne({
        staff_id: employeeId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!existingStaffInfo) {
        throw new NotFoundException(
          `Staff info not found for employee ${employeeId}`,
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

      // Check if social_id is unique if provided (excluding current staff member)
      if (dto.social_id) {
        const existingStaffWithSocialId =
          await this.staffInfoRepository.findOne({
            social_id: dto.social_id.trim(),
            id: Not(existingStaffInfo.id), // Exclude current staff member
            deletedAt: IsNull(),
            deletedById: IsNull(),
            deletedByType: IsNull(),
          });
        if (existingStaffWithSocialId) {
          throw new ConflictException(
            `Staff with social ID ${dto.social_id} already exists`,
          );
        }
      }

      const updatedFields: QueryDeepPartialEntity<StaffInfo> = {
        full_name: dto.full_name.trim(),
        social_id: dto.social_id?.trim() || null,
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
      throw new InternalServerErrorException(
        'Failed to update employee profile',
      );
    }
  }

  async getDegreeList(employeeId: string): Promise<Degree[]> {
    try {
      const staff = await this.staffInfoRepository.findOne({
        staff_id: employeeId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!staff) {
        throw new NotFoundException(
          `Staff info not found for employee ${employeeId}`,
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

  async addEmployeeDegree(
    employeeId: string,
    dto: EmployeeDegreeDto,
    currentUser: TokenPayload,
  ): Promise<Degree> {
    try {
      const staff = await this.staffInfoRepository.findOne({
        staff_id: employeeId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!staff) {
        throw new NotFoundException(
          `Staff info not found for employee ${employeeId}`,
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
          `Degree with name "${dto.name}" already exists for this employee`,
        );
      }

      const degree = new Degree();
      degree.name = dto.name.trim();
      degree.level = dto.level || null;
      degree.institution = dto.institution?.trim() || null;
      degree.year = dto.year || null;
      degree.description = dto.description?.trim() || null;
      degree.certificate_url = dto.certificate_url || null;
      degree.image_id = dto.image_id || null;
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

  async updateEmployeeDegree(
    employeeId: string,
    degreeId: string,
    dto: UpdateDegreeDto,
    currentUser: TokenPayload,
  ): Promise<Degree> {
    try {
      const staff = await this.staffInfoRepository.findOne({
        staff_id: employeeId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!staff) {
        throw new NotFoundException(
          `Staff info not found for employee ${employeeId}`,
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
          `Degree with ID ${degreeId} not found for employee ${employeeId}`,
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
          `Another degree with name "${dto.name}" already exists for this employee`,
        );
      }

      const updatedFields: QueryDeepPartialEntity<Degree> = {
        name: dto.name?.trim(),
        level: dto.level || null,
        institution: dto.institution?.trim() || null,
        year: dto.year || null,
        description: dto.description?.trim() || null,
        certificate_url: dto.certificate_url || null,
        image_id: dto.image_id || null,
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

  async deleteEmployeeDegree(
    employeeId: string,
    degreeId: string,
    currentUser: TokenPayload,
  ): Promise<void> {
    try {
      const staff = await this.staffInfoRepository.findOne({
        staff_id: employeeId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!staff) {
        throw new NotFoundException(
          `Staff info not found for employee ${employeeId}`,
        );
      }

      const degree = await this.degreeRepository.findOne(
        {
          id: degreeId,
          staff_info: { staff_id: employeeId },
          deletedAt: IsNull(),
          deletedById: IsNull(),
          deletedByType: IsNull(),
        },
        ['staff_info'],
      );

      if (!degree) {
        throw new NotFoundException(
          `Degree with ID ${degreeId} not found for employee ${employeeId}`,
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

  async getSpecializeList(employeeId: string): Promise<Specialize[]> {
    try {
      const staff = await this.staffInfoRepository.findOne({
        staff_id: employeeId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!staff) {
        throw new NotFoundException(
          `Staff info not found for employee ${employeeId}`,
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

  async addEmployeeSpecialize(
    employeeId: string,
    dto: EmployeeSpecializeDto,
    currentUser: TokenPayload,
  ): Promise<Specialize> {
    try {
      const staff = await this.staffInfoRepository.findOne({
        staff_id: employeeId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!staff) {
        throw new NotFoundException(
          `Staff info not found for employee ${employeeId}`,
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
          `Specialization with name "${dto.name}" already exists for this employee`,
        );
      }

      const specialize = new Specialize();
      specialize.name = dto.name.trim();
      specialize.description = dto.description.trim();
      specialize.certificate_url = dto.certificate_url || null;
      specialize.image_id = dto.image_id || null;
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

  async updateEmployeeSpecialize(
    employeeId: string,
    specializeId: string,
    dto: UpdateSpecializeDto,
    currentUser: TokenPayload,
  ): Promise<Specialize> {
    try {
      const staff = await this.staffInfoRepository.findOne({
        staff_id: employeeId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!staff) {
        throw new NotFoundException(
          `Staff info not found for employee ${employeeId}`,
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
          `Specialization with ID ${specializeId} not found for employee ${employeeId}`,
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
          `Another specialization with name "${dto.name}" already exists for this employee`,
        );
      }

      const updatedFields: QueryDeepPartialEntity<Specialize> = {
        name: dto.name?.trim(),
        description: dto.description?.trim(),
        certificate_url: dto.certificate_url || null,
        image_id: dto.image_id || null,
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

  async deleteEmployeeSpecialize(
    employeeId: string,
    specializeId: string,
    currentUser: TokenPayload,
  ): Promise<void> {
    try {
      const staff = await this.staffInfoRepository.findOne({
        staff_id: employeeId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!staff) {
        throw new NotFoundException(
          `Staff info not found for employee ${employeeId}`,
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
          `Specialization with ID ${specializeId} not found for employee ${employeeId}`,
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

  async getEmployeeByClinic(clinicId: string): Promise<any[]> {
    try {
      // Query employees by clinic_id
      const employees = await this.employeeRepository.find({
        clinic_id: clinicId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      // Fetch clinic information once since all employees belong to the same clinic
      const clinic = await this.clinicRepository.findOne({
        id: clinicId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      // Get staff info for each employee
      const results = await Promise.all(
        employees.map(async (employee) => {
          const staffInfo = await this.staffInfoRepository.findOne(
            {
              staff_id: employee.id,
              deletedAt: IsNull(),
              deletedById: IsNull(),
              deletedByType: IsNull(),
            },
            ['degrees', 'specializes'],
          );

          return {
            account: {
              id: employee.id,
              email: employee.email,
              clinic_id: employee.clinic_id,
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
          };
        }),
      );

      return results;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve employees by clinic',
      );
    }
  }

  async getEmployeeAccountById(
    id: string,
  ): Promise<{ id: string; email: string; clinic_id: string; clinic: any }> {
    try {
      const employee = await this.employeeRepository.findOne({
        id,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });
      if (!employee) {
        throw new NotFoundException('Employee not found');
      }

      // Fetch clinic information
      const clinic = await this.clinicRepository.findOne({
        id: employee.clinic_id,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      return {
        id: employee.id,
        email: employee.email,
        clinic_id: employee.clinic_id,
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
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve employee account',
      );
    }
  }

  async assignEmployeeToClinic(
    employeeId: string,
    clinicId: string,
    currentUser: TokenPayload,
  ): Promise<Employee> {
    try {
      const employee = await this.employeeRepository.findOne({
        id: employeeId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!employee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }

      const updateData = updateAudit({ clinic_id: clinicId }, currentUser);
      const updatedEmployee = await this.employeeRepository.findOneAndUpdate(
        { id: employeeId },
        updateData,
      );

      return updatedEmployee;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to assign employee to clinic',
      );
    }
  }

  async removeEmployeeFromClinic(
    employeeId: string,
    clinicId: string,
  ): Promise<{ message: string }> {
    try {
      // Validate employee exists
      const employee = await this.employeeRepository.findOne({
        id: employeeId,
        deletedAt: IsNull(),
        deletedById: IsNull(),
        deletedByType: IsNull(),
      });

      if (!employee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }

      // Check if employee is assigned to the specified clinic
      if (employee.clinic_id !== clinicId) {
        throw new NotFoundException(
          `Employee ${employeeId} is not assigned to clinic ${clinicId}`,
        );
      }

      // Remove the clinic assignment
      const updateData = { clinic_id: null };
      await this.employeeRepository.findOneAndUpdate(
        { id: employeeId },
        updateData,
      );

      return {
        message: `Employee ${employeeId} successfully removed from clinic ${clinicId}`,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to remove employee from clinic',
      );
    }
  }
}
