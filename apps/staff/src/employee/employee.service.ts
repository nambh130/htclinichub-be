import { BadRequestException, Injectable } from '@nestjs/common';
import { EmployeeRepository } from '../repositories/employee.repository';
import {
  setAudit,
  BaseService,
  CreateEmployeeAccountDto,
  TokenPayload,
  updateAudit,
} from '@app/common';
import { Employee } from '../models/employee.entity';
import * as bcrypt from 'bcrypt';
import { CommonRepository } from '../repositories/common.repository';

@Injectable()
export class EmployeeService extends BaseService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly commonRepository: CommonRepository,
  ) {
    super();
  }

  // async viewEmployeeAccountList(): Promise<any[]> {
  //   const employees = await this.employeeRepository.findAll();

  //   return employees;
  // }

  async createEmployeeAccount(
    dto: CreateEmployeeAccountDto,
    currentUser: TokenPayload,
  ): Promise<Employee> {
    const email = dto.email.trim().toLowerCase();

    if (await this.employeeRepository.checkEmployeeEmailExists(email)) {
      throw new BadRequestException(
        'A Employee with this email already exists.',
      );
    }

    const employee = new Employee();
    //If user-created event, insert with id
    if (dto.id) employee.id = dto.id;
    employee.email = email;
    employee.clinic_id = dto.clinic_id;
    employee.password = await bcrypt.hash(dto.password, 10);

    // Add audit fields
    setAudit(Employee, currentUser);

    return await this.employeeRepository.create(employee);
  }

  async lockEmployeeAccount(employeeId: string, currentUser: TokenPayload) {
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
  }

  async unlockEmployeeAccount(employeeId: string, currentUser: TokenPayload) {
    const doctor = await this.employeeRepository.findOne({ id: employeeId });

    if (!doctor) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    if (!doctor.is_locked) {
      return {
        message: `Employee account ${employeeId} is already unlocked`,
        doctor,
      };
    }

    const updateData = updateAudit({ is_locked: false }, currentUser);

    const updatedDoctor = await this.employeeRepository.findOneAndUpdate(
      { id: employeeId },
      updateData,
    );

    return {
      message: `Doctor account ${employeeId} has been unlocked`,
      unlockedBy: currentUser,
      employee: updatedDoctor,
    };
  }
}
