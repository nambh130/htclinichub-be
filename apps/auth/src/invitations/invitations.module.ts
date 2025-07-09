import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { AUTH_CONSUMER_GROUP, AUTH_SERVICE, PostgresDatabaseModule } from '@app/common';
import { InvitationRepository } from './invitation.repository';
import { EmployeeInvitation } from './models/invitation.entity';
import { InvitationsController } from './invitations.controller';
import { RolesModule } from '../roles/roles.module';
import { ClinicUsersModule } from '../clinic-users/clinic-users.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'auth',
              brokers: [configService.get('KAFKA_BROKER')!],
            },
            consumer: {
              groupId: AUTH_CONSUMER_GROUP,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    PostgresDatabaseModule,
    PostgresDatabaseModule.forFeature([EmployeeInvitation]),
    RolesModule,
    ClinicUsersModule,
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService, InvitationRepository],
  exports: [InvitationsService],
})
export class InvitationsModule { }
