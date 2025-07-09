import { Controller, Get } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeAccountDto, TokenPayload } from '@app/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('staff/employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}
  @Get('/employee-account-list')
  // @MessagePattern('view-employee-account-list')
  viewEmployeeAccountList() {
    return this.employeeService.viewEmployeeAccountList();
  }

  @MessagePattern('create-employee-account')
  createEmployeeAccount(
    @Payload()
    payload: {
      dto: CreateEmployeeAccountDto;
      currentUser: TokenPayload;
    },
  ) {
    return this.employeeService.createEmployeeAccount(
      payload.dto,
      payload.currentUser,
    );
  }

  @MessagePattern('lock-employee-account')
  async lockEmployeeAccount(
    @Payload()
    data: {
      id: string;
      currentUser: TokenPayload;
    },
  ) {
    return this.employeeService.lockEmployeeAccount(data.id, data.currentUser);
  }

  @MessagePattern('unlock-employee-account')
  async unlockEmployeeAccount(
    @Payload()
    data: {
      id: string;
      currentUser: TokenPayload;
    },
  ) {
    return this.employeeService.unlockEmployeeAccount(
      data.id,
      data.currentUser,
    );
  }
}
