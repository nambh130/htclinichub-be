import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateDoctorAccountDto } from '@app/common';

@Controller()
export class ManageDoctorScheduleController {
  constructor(private readonly doctorService: DoctorService) { }

  @MessagePattern('doctor-view-working-shift')
  async getDoctorsByIds(@Payload() data: { ids: number[] }) {
    console.log('Received IDs Doctor Service:', data.ids);
    // Gọi đến service thật nếu đã có, tạm thời trả mock:
    return this.doctorService.getDoctorsByIds({ ids: data.ids });
  }
}
