import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AUTH_CONSUMER_GROUP, AUTH_SERVICE, LoggerModule } from '@app/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { PatientsModule } from './patients/patients.module';
import { ClinicUsersModule } from './clinic-users/clinic-users.module';
import { ClinicsModule } from './clinics/clinics.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { InvitationsModule } from './invitations/invitations.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { JwtStrategy } from '@app/common/auth/jwt.strategy';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';
import { ClinicEventController } from './clinics/clinic-event.controller';
import { OtpService } from './otp/otp.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        KAFKA_BROKER: Joi.required(),
        AUTH_SERVICE_DB: Joi.string().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_EXPIRES: Joi.number().required(),
        JWT_EXPIRES_IN: Joi.number().required(),
        JWT_SECRET: Joi.string().required(),
        RESET_PWD_URL: Joi.string().required(),
      }),
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRES_IN')}s`,
        },
      }),
      inject: [ConfigService],
    }),
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
    LoggerModule,
    PatientsModule,
    ClinicUsersModule,
    ClinicsModule,
    InvitationsModule,
    RolesModule,
    PermissionsModule,
    RefreshTokenModule,
  ],
  controllers: [AuthController, ClinicEventController],
  exports: [AuthService, JwtModule],
  providers: [AuthService, JwtStrategy, OtpService],
})
export class AuthModule { }
