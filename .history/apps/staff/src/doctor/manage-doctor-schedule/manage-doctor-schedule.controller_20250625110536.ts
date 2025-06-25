import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateDoctorAccountDto } from '@app/common';

@Controller()
export class ManageDoctorScheduleController {
  constructor(private readonly doctorService: DoctorService) { }

  @MessagePattern('create-doctor-account')
  create(@Payload() dto: CreateDoctorAccountDto) {
    return this.doctorService.createDoctorAccount(dto);
  }

  @MessagePattern('get-doctors-by-ids')
  async getDoctorsByIds(@Payload() data: { ids: number[] }) {
    console.log('Received IDs Doctor Service:', data.ids);
    // Gọi đến service thật nếu đã có, tạm thời trả mock:
    return this.doctorService.getDoctorsByIds({ ids: data.ids });
  }
}
