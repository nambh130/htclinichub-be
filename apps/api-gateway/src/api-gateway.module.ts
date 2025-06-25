import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { LoggerModule } from '@app/common';
import { AuthModule } from './auth/auth.module';
import { ReservationsModule } from './reservations/reservations.module';
import { StaffModule } from './staff/staff.module';
import { ClinicModule } from './clinics/clinic.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    //Global Config Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/api-gateway/.env',
      validationSchema: Joi.object({
        KAFKA_BROKER: Joi.string().required(),
        PORT: Joi.number().default(3000),

        STAFF_SERVICE_HOST: Joi.string(),
        STAFF_SERVICE_PORT: Joi.number(),
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

    //Single imports
    StaffModule,
    AuthModule,
    ReservationsModule,
    HttpModule,
    LoggerModule,
    ClinicModule,
    
  ],
})
export class ApiGatewayModule {}