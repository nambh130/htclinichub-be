import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { ClinicUser } from '../../clinic-users/models/clinic-user.entity';
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

  @ManyToOne(() => ClinicUser, (user) => user.ownerOf, { nullable: true })
  @JoinColumn()
  owner: ClinicUser;

  @ManyToMany(() => ClinicUser, (user) => user.clinics)
  users: ClinicUser[]
}
