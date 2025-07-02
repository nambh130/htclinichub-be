import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IsNull } from 'typeorm';
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
} from '@app/common';

import { Employee } from '../models/employee.entity';
import { StaffInfo } from '../models/staffInfo.entity';
import { Degree } from '../models/degree.entity';
import { Specialize } from '../models/specialize.entity';

import { EmployeeRepository } from '../repositories/employee.repository';
import { StaffInfoRepository } from '../repositories/staffInfo.repository';
import { DegreeRepository } from '../repositories/degree.repository';
import { SpecializeRepository } from '../repositories/specialize.repository';

@Injectable()
export class EmployeeService extends BaseService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly staffInfoRepository: StaffInfoRepository,
    private readonly degreeRepository: DegreeRepository,
    private readonly specializeRepository: SpecializeRepository,
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

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to retrieve employee accounts',
      );
    }
  }

  async getEmployeeById(employeeId: string): Promise<Employee> {
    try {
      if (!employeeId || employeeId.trim() === '') {
        throw new BadRequestException('Employee ID is required');
      }

      const employee = await this.employeeRepository.findOne({
        id: employeeId,
      });

      if (!employee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }

      return employee;
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
  ): Promise<{
    data: Employee[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      return await this.employeeRepository.paginate({
        where: {
          deletedAt: IsNull(),
          deletedById: IsNull(),
          deletedByType: IsNull(),
        },
        relations: ['staffInfo'],
        page,
        limit,
      });
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
      employee.email = email;
      employee.password = await bcrypt.hash(dto.password, 10);
      employee.clinic_id = dto.clinic;

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
        { id: employeeId },
        [],
      );

      if (!employee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }

      const staffInfo = await this.staffInfoRepository.findOne(
        { staff_id: employeeId },
        ['degrees', 'specializes'],
      );

      const profile = {
        account: {
          id: employee.id,
          email: employee.email,
          clinic_id: employee.clinic_id,
          is_locked: employee.is_locked,
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
      const employee = await this.employeeRepository.findOne({ id: staffId });
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${staffId} not found`);
      }

      const existingStaffInfo = await this.staffInfoRepository.findOne({
        staff_id: staffId,
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

      const staffInfo = new StaffInfo();
      staffInfo.staff_id = staffId;
      staffInfo.full_name = dto.full_name.trim();
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
      });
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }

      const existingStaffInfo = await this.staffInfoRepository.findOne({
        staff_id: employeeId,
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
      throw new InternalServerErrorException(
        'Failed to update employee profile',
      );
    }
  }

  async getDegreeList(employeeId: string): Promise<Degree[]> {
    try {
      const staff = await this.staffInfoRepository.findOne({
        staff_id: employeeId,
      });

      if (!staff) {
        throw new NotFoundException(
          `Staff info not found for employee ${employeeId}`,
        );
      }

      const degrees = await this.degreeRepository.find({
        staff_info: { id: staff.id },
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
      });

      if (!staff) {
        throw new NotFoundException(
          `Staff info not found for employee ${employeeId}`,
        );
      }

      const existingDegrees = await this.degreeRepository.find({
        staff_info: { id: staff.id },
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

  async updateEmployeeDegree(
    employeeId: string,
    degreeId: string,
    dto: UpdateDegreeDto,
    currentUser: TokenPayload,
  ): Promise<Degree> {
    try {
      const staff = await this.staffInfoRepository.findOne({
        staff_id: employeeId,
      });

      if (!staff) {
        throw new NotFoundException(
          `Staff info not found for employee ${employeeId}`,
        );
      }

      const existingDegree = await this.degreeRepository.findOne({
        id: degreeId,
        staff_info: { id: staff.id },
      });

      if (!existingDegree) {
        throw new NotFoundException(
          `Degree with ID ${degreeId} not found for employee ${employeeId}`,
        );
      }

      const otherDegrees = await this.degreeRepository.find({
        staff_info: { id: staff.id },
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

  async deleteEmployeeDegree(
    employeeId: string,
    degreeId: string,
  ): Promise<void> {
    try {
      const staff = await this.staffInfoRepository.findOne({
        staff_id: employeeId,
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
        },
        ['staff_info'],
      );

      if (!degree) {
        throw new NotFoundException(
          `Degree with ID ${degreeId} not found for employee ${employeeId}`,
        );
      }

      await this.degreeRepository.findOneAndDelete({ id: degreeId });
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
      });

      if (!staff) {
        throw new NotFoundException(
          `Staff info not found for employee ${employeeId}`,
        );
      }

      const specializes = await this.specializeRepository.find({
        staff_info: { id: staff.id },
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
      });

      if (!staff) {
        throw new NotFoundException(
          `Staff info not found for employee ${employeeId}`,
        );
      }

      const existingSpecializations = await this.specializeRepository.find({
        staff_info: { id: staff.id },
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

  async updateEmployeeSpecialize(
    employeeId: string,
    specializeId: string,
    dto: UpdateSpecializeDto,
    currentUser: TokenPayload,
  ): Promise<Specialize> {
    try {
      const staff = await this.staffInfoRepository.findOne({
        staff_id: employeeId,
      });

      if (!staff) {
        throw new NotFoundException(
          `Staff info not found for employee ${employeeId}`,
        );
      }

      const existingSpecialize = await this.specializeRepository.findOne({
        id: specializeId,
        staff_info: { id: staff.id },
      });

      if (!existingSpecialize) {
        throw new NotFoundException(
          `Specialization with ID ${specializeId} not found for employee ${employeeId}`,
        );
      }

      const otherSpecializations = await this.specializeRepository.find({
        staff_info: { id: staff.id },
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

  async deleteEmployeeSpecialize(
    employeeId: string,
    specializeId: string,
  ): Promise<void> {
    try {
      const staff = await this.staffInfoRepository.findOne({
        staff_id: employeeId,
      });

      if (!staff) {
        throw new NotFoundException(
          `Staff info not found for employee ${employeeId}`,
        );
      }

      const specialize = await this.specializeRepository.findOne({
        id: specializeId,
        staff_info: { id: staff.id },
      });

      if (!specialize) {
        throw new NotFoundException(
          `Specialization with ID ${specializeId} not found for employee ${employeeId}`,
        );
      }

      await this.specializeRepository.findOneAndDelete({ id: specializeId });
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
      });

      // Get staff info for each employee
      const results = await Promise.all(
        employees.map(async (employee) => {
          const staffInfo = await this.staffInfoRepository.findOne(
            { staff_id: employee.id },
            ['degrees', 'specializes'],
          );

          return {
            account: {
              id: employee.id,
              email: employee.email,
              clinic_id: employee.clinic_id,
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
  ): Promise<{ id: string; email: string; clinic_id: string }> {
    try {
      const employee = await this.employeeRepository.findOne({ id });
      if (!employee) {
        throw new NotFoundException('Employee not found');
      }

      return {
        id: employee.id,
        email: employee.email,
        clinic_id: employee.clinic_id,
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
}
