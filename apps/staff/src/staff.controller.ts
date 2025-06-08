import { Controller } from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateDoctorAccountDto } from '@app/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @MessagePattern('create-doctor-account')
  create(@Payload() dto: CreateDoctorAccountDto) {
    return this.staffService.createDoctorAccount(dto);
  }
}
