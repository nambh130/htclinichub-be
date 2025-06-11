import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';
import { UserClinicLink } from './user-clinics-links.entity';
import { PostgresAbstractEntity } from '@app/common';
import { Clinic } from '../../clinics/models/clinic.entity';

@Entity({ name: 'clinic_users' })
export class ClinicUser extends PostgresAbstractEntity<ClinicUser> {
  constructor(user?: Partial<ClinicUser>) {
    super();
    if (user) Object.assign(this, user);
  }

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: "user_type", type: 'varchar', length: 50 })
  userType: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @OneToMany(() => Clinic, (clinic) => clinic.owner)
  clinics: Clinic[];

  @OneToMany(() => UserClinicLink, (link) => link.user)
  userClinicLinks: UserClinicLink[];
}
