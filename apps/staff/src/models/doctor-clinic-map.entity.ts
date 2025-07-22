import { Entity, ManyToOne, JoinColumn, Unique, Column } from 'typeorm';
import { Doctor } from './doctor.entity';
import { Clinic } from './clinic.entity';
import { PostgresAbstractEntity } from '@app/common';

export enum DoctorClinicStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
}

@Entity({ name: 'doctor_clinic_maps' })
@Unique(['doctor', 'clinic'])
export class DoctorClinicMap extends PostgresAbstractEntity<DoctorClinicMap> {
  constructor(link?: Partial<DoctorClinicMap>) {
    super();
    if (link) Object.assign(this, link);
  }

  @ManyToOne(() => Doctor, (doctor) => doctor.id)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ManyToOne(() => Clinic, (clinic) => clinic.doctorClinicMaps)
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @Column({
    type: 'integer',
    name: 'exam_fee',
    nullable: true,
  })
  examFee: number;
  @Column({
    type: 'enum',
    enum: DoctorClinicStatus,
    default: DoctorClinicStatus.ACTIVE,
  })
  status: DoctorClinicStatus;

}
