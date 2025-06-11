import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ClinicUser } from '../../clinic-users/models/clinic-user.entity';
import { UserClinicLink } from '../../clinic-users/models/user-clinics-links.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity({ name: 'clinics' })
export class Clinic extends PostgresAbstractEntity<Clinic> {
  constructor(clinic?: Partial<Clinic>) {
    super();
    if (clinic) Object.assign(this, clinic);
  }

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @ManyToOne(() => ClinicUser, (user) => user.clinics)
  @JoinColumn({ name: 'owner_id' })
  owner: ClinicUser;

  @OneToMany(() => UserClinicLink, (link) => link.clinic)
  userClinicLinks: UserClinicLink[];
}
