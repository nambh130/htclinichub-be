import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { StaffInfo } from './staffInfo.entity';
import { Invitation } from './invitation.entity';
import { DoctorServiceLink } from './doctorServiceLinks.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { DoctorClinicMap } from './doctor-clinic-map.entity';
import { Clinic } from './clinic.entity';

@Entity()
export class Doctor extends PostgresAbstractEntity<Doctor> {
  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  is_locked: boolean;

  @OneToMany(() => Invitation, (invitation) => invitation.doctor)
  invitations: Invitation[];

  @OneToMany(() => DoctorServiceLink, (link) => link.doctor)
  services: DoctorServiceLink[];

  @OneToMany(() => DoctorClinicMap, (clinicMap) => clinicMap.doctor, {
    cascade: true,
  })
  clinics: DoctorClinicMap[];

  @OneToMany(() => Clinic, (clinic) => clinic.owner)
  ownerOf: Clinic[];


}
