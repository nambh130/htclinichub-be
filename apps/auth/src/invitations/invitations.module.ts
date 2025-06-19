import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { PostgresDatabaseModule } from '@app/common';
import { InvitationRepository } from './invitation.repository';
import { EmployeeInvitation } from './models/invitation.entity';
import { InvitationsController } from './invitations.controller';
import { RolesModule } from '../roles/roles.module';
import { ClinicUsersModule } from '../clinic-users/clinic-users.module';

@Module({
  imports: [
    PostgresDatabaseModule,
    PostgresDatabaseModule.forFeature([EmployeeInvitation]),

    RolesModule,
    ClinicUsersModule
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService, InvitationRepository ],
  exports: [InvitationsService]
})
export class InvitationsModule { }
