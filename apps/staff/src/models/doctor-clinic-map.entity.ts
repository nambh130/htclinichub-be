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

@Entity({ name: 'doctor_clinic_maps', })
@Unique(['doctor', 'clinic'])
export class DoctorClinicMap {
  constructor(link?: Partial<DoctorClinicMap>) {
    if (link) Object.assign(this, link);
  }
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Doctor, (user) => user.id)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  // @Column({ name: 'clinic_id' })
  // clinic: string;

  @ManyToOne(() => Clinic, (clinic) => clinic.doctorClinicMaps, { eager: false })
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;
}
