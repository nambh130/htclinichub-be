import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DoctorService } from './doctor.service';
import { CreateDoctorAccountDto } from '@app/common';

@Controller()
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @MessagePattern('create-doctor-account')
  create(@Payload() dto: CreateDoctorAccountDto) {
    return this.doctorService.createDoctorAccount(dto);
  }
}
