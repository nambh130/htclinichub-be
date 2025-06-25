import { PostgresAbstractEntity } from '@app/common';
import { Column, Entity, OneToMany } from 'typeorm';
import { Invitation } from './invitation.entity';
import { DoctorServiceLink } from './doctorServiceLinks.entity';

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
}
