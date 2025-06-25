import { Controller } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { ActorType, CreateEmployeeAccountDto } from '@app/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { ClinicUserCreated } from '@app/common/events/auth/clinic-user-created.event';
import { ActorEnum } from '@app/common/enum/actor-type';

@Controller()
export class EmployeeEventController {
  constructor(private readonly employeeService: EmployeeService) { }

  @MessagePattern('view-employee-account-list')
  viewEmployeeAccountList() {
    return this.employeeService.viewEmployeeAccountList();
  }

  @EventPattern('clinic-user-created')
  createEmployeeAccount(
    @Payload() data: ClinicUserCreated
  ) {
    if (data.actorType == ActorEnum.EMPLOYEE) {
      const { email, clinicId, actorType, id } = data;
      console.log("found: ", data);
      return this.employeeService.createEmployeeAccount(
        {
          email,
          clinic_id: clinicId,
          password: "Abc@123.com"
        },
        {
          id,
          type: actorType as ActorType
        },
      );
    }
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

