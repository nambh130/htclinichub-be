import { ConfigModule, ConfigService } from "@nestjs/config";
import { FavouriteDoctorService } from "./favourite_doctor.service";
import { FavouriteDoctorRepository } from "./favourite_doctor.repository";
import { Transport } from "@nestjs/microservices";

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'patients-to-staff',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'patients-to-staff-client',
              brokers: [configService.get('KAFKA_BROKER')],
            },
            consumer: {
              groupId: 'patients-to-staff-consumer',
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [FavouriteDoctorService, FavouriteDoctorRepository],
  exports: [FavouriteDoctorService],
})
export class FavouriteDoctorModule {}
