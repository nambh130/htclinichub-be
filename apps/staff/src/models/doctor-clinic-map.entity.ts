import { Entity, ManyToOne, JoinColumn, Column, Unique } from 'typeorm';
import { Doctor } from './doctor.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity({ name: 'doctor_clinic_maps' })
@Unique(['doctor', 'clinic'])
export class DoctorClinicMap extends PostgresAbstractEntity<DoctorClinicMap> {
  @ManyToOne(() => Doctor, (user) => user.id)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @Column({ name: 'clinic_id' })
  clinic: string;
}
