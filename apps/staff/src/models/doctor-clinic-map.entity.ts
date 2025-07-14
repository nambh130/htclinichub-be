import { Entity, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Doctor } from './doctor.entity';
import { Clinic } from './clinic.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity({ name: 'doctor_clinic_maps' })
@Unique(['doctor', 'clinic'])
export class DoctorClinicMap extends PostgresAbstractEntity<DoctorClinicMap> {
  constructor(link?: Partial<DoctorClinicMap>) {
    super();
    if (link) Object.assign(this, link);
  }

  @ManyToOne(() => Doctor, (user) => user.id)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ManyToOne(() => Clinic, (clinic) => clinic.doctorClinicMaps)
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  // Keep the clinic_id as a separate column for backwards compatibility
  // @Column({ name: 'clinic_id' })
  // clinicId: string;
}
