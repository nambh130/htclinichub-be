import { ClientsModule, Transport } from '@nestjs/microservices';
import { STAFF_SERVICE, AUTH_SERVICE } from '@app/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        httpClientConfig(
          configService.get<string>('STAFF_SERVICE_HOST'),
          configService.get<string>('STAFF_SERVICE_PORT'),
        ),
      inject: [ConfigService],
    }),
    ClientsModule.registerAsync([
      {
        name: STAFF_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'staff',
              brokers: [config.get<string>('KAFKA_BROKER')],
            },
            consumer: {
              groupId: 'staff-consumer',
            },
          },
        }),
      },
      {
        name: AUTH_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'auth',
              brokers: [config.get<string>('KAFKA_BROKER')],
            },
            consumer: {
              groupId: 'auth-consumer',
            },
          },
        }),
      },
    ]),
    AuthModule,
  ],
  controllers: [StaffController],
  providers: [StaffService, ManageDoctorScheduleService],
  exports: [StaffService, ManageDoctorScheduleService],
})
export class StaffModule {}
