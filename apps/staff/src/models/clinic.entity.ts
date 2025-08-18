import { BaseClinic } from '@app/common/modules/clinic/models/base-clinic.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Doctor } from './doctor.entity';
import { DoctorClinicMap } from './doctor-clinic-map.entity';
// import { Doctor_WorkShift } from './doctor_workshift.entity';

@Entity({ name: 'clinic' })
export class Clinic extends BaseClinic {
  constructor(clinic?: Partial<Clinic>) {
    super();
    if (clinic) Object.assign(this, clinic);
  }

  @ManyToOne(() => Doctor, { nullable: true })
  @JoinColumn({ name: 'ownerId' })
  owner: Doctor;

  @Column({ type: 'uuid', nullable: true })
  ownerId: string;

  @OneToMany(() => DoctorClinicMap, (map) => map.clinic, { cascade: true })
  doctorClinicMaps: DoctorClinicMap[];

  // @OneToMany(() => Doctor_WorkShift, (workshift) => workshift.clinic)
  // workShifts: Doctor_WorkShift[];
}
