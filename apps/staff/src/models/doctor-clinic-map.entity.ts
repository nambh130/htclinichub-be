import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  Unique,
} from 'typeorm';
import { Doctor } from './doctor.entity';

@Entity({ name: 'doctor_clinic_maps', })
@Unique(['doctor', 'clinic'])
export class DoctorClinicMap {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Doctor, (user) => user.id)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @Column({ name: 'clinic_id' })
  clinic: string;
}

