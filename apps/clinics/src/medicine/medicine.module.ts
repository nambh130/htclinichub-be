import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicineService } from './medicine.service';
import { MedicineController } from './medicine.controller';
import { MedicineRepository } from './medicine.repository';
import { ClinicRepository } from '../clinic.repository';
import { Clinic, Medicine } from '@clinics/models';
import { ClinicsModule } from '@clinics/clinics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medicine]),
    forwardRef(() => ClinicsModule), 
  ],
    controllers: [MedicineController],
    providers: [MedicineService, MedicineRepository],
    exports: [MedicineService, MedicineRepository],
})
export class MedicineModule { }