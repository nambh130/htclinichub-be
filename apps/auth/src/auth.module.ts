import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from './users/users.module';
import { AUTH_CONSUMER_GROUP, AUTH_SERVICE, LoggerModule } from '@app/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PatientsModule } from './patients/patients.module';
import { OtpModule } from './otp/otp.module';
import { ClinicUsersModule } from './clinic-users/clinic-users.module';
import { ClinicsModule } from './clinics/clinics.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({ //dotenv setup
      isGlobal: true,
      envFilePath: './apps/auth/.env',
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.number().default(3600),
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
    UsersModule,
    LoggerModule,
    PatientsModule,
    OtpModule,
    ClinicUsersModule,
    ClinicsModule
  ],
  controllers: [AuthController],
  exports: [AuthService],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
