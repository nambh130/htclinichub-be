import { Controller } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ClinicUserCreated } from '@app/common/events/auth/clinic-user-created.event';
import { ActorEnum } from '@app/common/enum/actor-type';

@Controller()
export class DoctorEventController {
  constructor(private readonly doctorService: DoctorService) { }

  @EventPattern('clinic-user-created')
  createDoctorAccount(
    @Payload()
    payload: ClinicUserCreated,
  ) {
    if (payload.actorType == ActorEnum.DOCTOR) {
      const { email, clinicId, actorType, id: userId } = payload;
      return this.doctorService.createDoctorAccount(
        {
          id: userId,
          email,
          clinic: clinicId,
          //clinic_id: clinicId,
          password: 'Abc@123.com',
        },
        {
          userId,
          actorType: actorType,
        },
      );
    }
  }

  @EventPattern('user-clinic-joined')
  userJoinClinic(
    @Payload() payload: { userId: string, clinicId: string }
  ) {
    const { userId, clinicId } = payload
    this.doctorService.doctorJoinClinic(userId, clinicId)
  }
}
