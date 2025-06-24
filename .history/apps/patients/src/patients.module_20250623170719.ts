// apps/patients/patients.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { Patient, PatientSchema } from './models';
import { MongoDatabaseModule, LoggerModule } from '@app/common';
import * as Joi from 'joi';
import { FavouriteDoctorModule } from './favourite-doctor/favourite_doctor.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/patients/.env',
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        // các biến POSTGRES_* cũng nên khai báo nếu bạn dùng .env chung
      }),
    }),

    LoggerModule,

    // Kết nối Mongo
    MongoDatabaseModule,
    MongoDatabaseModule.forFeature([
      {
        name: Patient.name,
        schema: PatientSchema,
      },
    ]),

    // Import Postgre module con
    FavouriteDoctorModule,
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
})
export class PatientsModule {}
