import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { STAFF_CONSUMER_GROUP, STAFF_SERVICE } from '@app/common';
import { AuthModule } from '../auth/auth.module';
//docker-compose up zookeeper kafka postgres auth staff api-gateway --build --watch
@Module({
  imports: [
    // Microservices clients for Kafka communication
    ClientsModule.registerAsync([
      {
        name: STAFF_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'staff',
              brokers: [configService.get('KAFKA_BROKER')!],
            },
            consumer: {
              groupId: STAFF_CONSUMER_GROUP,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    AuthModule,
  ],
  controllers: [StaffController],
  providers: [StaffService, ],

    providers: [PatientService, FavouriteDoctorService, DownLoadMedicalReportService],
    exports: [PatientService, FavouriteDoctorService, DownLoadMedicalReportService],
})
export class StaffModule {}
