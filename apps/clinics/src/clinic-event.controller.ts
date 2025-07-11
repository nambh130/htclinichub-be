import { Controller } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ClinicUserCreated } from '@app/common/events/auth/clinic-user-created.event';
import { ActorEnum } from '@app/common/enum/actor-type';
import { ClinicOwnerAdded } from '@app/common/events/auth/clinic-owner-added.event';

@Controller()
export class ClinicEventController {
  constructor(private readonly clinicService: ClinicsService) {}

  @EventPattern('clinic-user-created')
  async handleUserCreated(
    @Payload()
    payload: ClinicUserCreated,
  ) {
    const { ownerOf, actorType, id } = payload;
    console.log('clinic1: ', payload);
    if (actorType == ActorEnum.DOCTOR && ownerOf) {
      const clinic = await this.clinicService.getClinicById(ownerOf, id);
      await this.clinicService.updateClinic(
        ownerOf,
        {
          location: clinic.location,
          name: clinic.name,
          ownerId: id,
        },
        id,
      );
    }
  }

  @EventPattern('clinic-owner-added')
  async handleOwnerAdded(@Payload() payload: ClinicOwnerAdded) {
    const { ownerId, clinicId } = payload;
    console.log('clinic2: ', payload);

    const clinic = await this.clinicService.getClinicById(clinicId, ownerId);
    console.log(clinic);
    const result = await this.clinicService.updateClinic(
      clinicId,
      {
        location: clinic.location,
        name: clinic.name,
        ownerId: payload.ownerId,
      },
      ownerId,
    );
    console.log(result);
  }
}
