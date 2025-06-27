import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Column,
} from 'typeorm';
import { Doctor } from './doctor.entity';
import { Clinic } from './clinic.entity';

@Entity({ name: 'doctor_clinic_maps' })
@Unique(['doctor', 'clinic'])
export class DoctorClinicMap {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.clinics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ManyToOne(() => Clinic, (clinic) => clinic.doctorClinicMaps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;
}
