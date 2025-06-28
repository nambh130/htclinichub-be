import { PostgresAbstractEntity } from '@app/common';
import { Invitation } from './invitation.entity';
import { DoctorServiceLink } from './doctorServiceLinks.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { DoctorClinicMap } from './doctor-clinic-map.entity';
import { StaffInfo } from './staffInfo.entity';
import { Doctor_WorkShift } from './doctor_workshift.entity';

@Entity()
export class Doctor extends PostgresAbstractEntity<Doctor> {
  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  is_locked: boolean;

  @OneToOne(() => StaffInfo)
  @JoinColumn({ name: 'staff_info_id', referencedColumnName: 'id' })
  staffInfo: StaffInfo;

  @OneToMany(() => Invitation, (invitation) => invitation.doctor)
  invitations: Invitation[];

  @OneToMany(() => DoctorServiceLink, (link) => link.doctor)
  services: DoctorServiceLink[];

  @OneToMany(() => DoctorClinicMap, (clinic) => clinic.doctor, {
    cascade: true,
  })

  @OneToMany(() => Doctor_WorkShift, (shift) => shift.doctor)
  shifts: Doctor_WorkShift[];

  @OneToOne(() => StaffInfo, { eager: true }) // eager để tự động load
  @JoinColumn({ name: 'staff_info_id' }) // tên cột ngoại khóa (nếu có)
  staff_info: StaffInfo;

  clinics: DoctorClinicMap[];
}
