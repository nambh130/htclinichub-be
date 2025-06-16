import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { StaffInfo } from './staffInfo.entity';
import { Invitation } from './invitation.entity';
import { DoctorServiceLink } from './doctorServiceLinks.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity()
export class Doctor extends PostgresAbstractEntity<Doctor> {
  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  is_locked: boolean;

  @OneToOne(() => StaffInfo)
  @JoinColumn({ name: 'staff_info_id' })
  staff_info: StaffInfo;

  @OneToMany(() => Invitation, (invitation) => invitation.doctor)
  invitations: Invitation[];

  @OneToMany(() => DoctorServiceLink, (link) => link.doctor)
  services: DoctorServiceLink[];
}
