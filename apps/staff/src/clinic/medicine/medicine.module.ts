import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicineService } from './medicine.service';
import { MedicineController } from './medicine.controller';
import { Medicine } from '../../models/medicine.entity';
import { MedicineRepository } from './medicine.repository';
import { ClinicRepository } from '../clinic.repository';
import { Clinic } from '../../models/clinic.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Medicine, Clinic]),
    ],
    controllers: [MedicineController],
    providers: [MedicineService, MedicineRepository, ClinicRepository],
    exports: [MedicineService, MedicineRepository, ClinicRepository],
})
export class MedicineModule { }