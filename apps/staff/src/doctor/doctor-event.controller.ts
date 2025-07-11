import { Controller } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ClinicUserCreated } from '@app/common/events/auth/clinic-user-created.event';
import { ActorEnum } from '@app/common/enum/actor-type';
import { ClinicService } from '../clinic/clinic.service';

@Controller()
export class DoctorEventController {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly clinicService: ClinicService,
  ) {}

  @EventPattern('clinic-user-created')
  async createDoctorAccount(
    @Payload()
    payload: ClinicUserCreated,
  ) {
    if (payload.actorType == ActorEnum.DOCTOR) {
      const { email, clinicId, actorType, id: userId } = payload;
      const user = await this.doctorService.createDoctorAccount(
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
      if (payload.ownerOf) {
        const clinic = await this.clinicService.getClinicById(payload.ownerOf);
        clinic!.owner = user;
        await this.clinicService.save(clinic!);
      }
    }
    return null;
  }

  @EventPattern('user-clinic-joined')
  userJoinClinic(@Payload() payload: { userId: string; clinicId: string }) {
    const { userId, clinicId } = payload;
    this.doctorService.doctorJoinClinic(userId, clinicId);
  }
}
