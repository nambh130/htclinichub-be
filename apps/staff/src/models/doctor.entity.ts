// doctor.entity.ts
import { Column, Entity, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Invitation } from './invitation.entity';
import { DoctorServiceLink } from './doctorServiceLinks.entity';
import { StaffInfo } from './staffInfo.entity';
import { PostgresAbstractEntity } from '@app/common';

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

  @OneToOne(() => StaffInfo, (staffInfo) => staffInfo.doctor, {
    cascade: true,
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'staff_info_id' })
  staff_info: StaffInfo;
}
