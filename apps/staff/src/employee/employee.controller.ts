import { Controller } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { ActorType, CreateEmployeeAccountDto } from '@app/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @MessagePattern('view-employee-account-list')
  viewEmployeeAccountList() {
    return this.employeeService.viewEmployeeAccountList();
  }

  @MessagePattern('create-employee-account')
  createEmployeeAccount(
    @Payload()
    payload: {
      dto: CreateEmployeeAccountDto;
      user: { id: string; type: ActorType };
    },
  ) {
    return this.employeeService.createEmployeeAccount(
      payload.dto,
      payload.user,
    );
  }

  @MessagePattern('lock-employee-account')
  async lockEmployeeAccount(
    @Payload()
    data: {
      id: string;
      user: { id: string; type: ActorType };
    },
  ) {
    return this.employeeService.lockEmployeeAccount(data.id, data.user);
  }

  @MessagePattern('unlock-employee-account')
  async unlockEmployeeAccount(
    @Payload()
    data: {
      id: string;
      user: { id: string; type: ActorType };
    },
  ) {
    return this.employeeService.unlockEmployeeAccount(data.id, data.user);
  }
}
