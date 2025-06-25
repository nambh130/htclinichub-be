import { BadRequestException, Injectable } from '@nestjs/common';
import { EmployeeRepository } from '../repositories/employee.repository';
import {
  ActorType,
  applyAuditFields,
  BaseService,
  CreateEmployeeAccountDto,
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

  async viewEmployeeAccountList(): Promise<any[]> {
    const employees = await this.employeeRepository.findAll();

    const enrichedEmployees = await Promise.all(
      employees.data.map(async (employee) => {
        const createdBy = await this.commonRepository.findActorWithIdAndType(
          employee.createdByType,
          employee.createdById,
        );
        const updatedBy = await this.commonRepository.findActorWithIdAndType(
          employee.updatedByType,
          employee.updatedById,
        );

        const {
          createdById: _createdById,
          createdByType: _createdByType,
          updatedById: _updatedById,
          updatedByType: _updatedByType,
          password: _password,
          ...rest
        } = employee;

        return {
          ...rest,
          createdBy,
          updatedBy,
        };
      }),
    );

    return enrichedEmployees;
  }

  async createEmployeeAccount(
    dto: CreateEmployeeAccountDto,
    user: { id: string; type: ActorType },
  ): Promise<Employee> {
    const email = dto.email.trim().toLowerCase();

    if (await this.employeeRepository.checkEmployeeEmailExists(email)) {
      throw new BadRequestException(
        'A Employee with this email already exists.',
      );
    }

    const employee = new Employee();
    //If user-created event, insert with id
    if(dto.id) employee.id = dto.id;
    employee.email = email;
    employee.clinic_id = dto.clinic_id;
    employee.password = await bcrypt.hash(dto.password, 10);

    // Add audit fields
    //applyAuditFields(Employee, user);

    return await this.employeeRepository.create(employee);
  }

  async lockEmployeeAccount(
    employeeId: string,
    user: { id: string; type: ActorType },
  ) {
    const employee = await this.employeeRepository.findOne({ id: employeeId });

    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    if (employee.is_locked) {
      return {
        message: `Employee account ${employeeId} is already locked`,
        employee,
      };
    }

    const updatedEmployee = await this.employeeRepository.findOneAndUpdate(
      { id: employeeId },
      {
        is_locked: true,
        updatedById: user.id.toString(),
        updatedByType: user.type,
        updatedAt: new Date(),
      },
    );

    return {
      message: `Employee account ${employeeId} has been locked`,
      lockedBy: user,
      employee: updatedEmployee,
    };
  }

  async unlockEmployeeAccount(
    employeeId: string,
    user: { id: string; type: ActorType },
  ) {
    const employee = await this.employeeRepository.findOne({ id: employeeId });

    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    if (!employee.is_locked) {
      return {
        message: `Employee account ${employeeId} is already unlocked`,
        employee,
      };
    }

    const updatedEmployee = await this.employeeRepository.findOneAndUpdate(
      { id: employeeId },
      {
        is_locked: false,
        updatedById: user.id.toString(),
        updatedByType: user.type,
        updatedAt: new Date(),
      },
    );

    return {
      message: `Employee account ${employeeId} has been unlocked`,
      unlockedBy: user,
      employee: updatedEmployee,
    };
  }
}
