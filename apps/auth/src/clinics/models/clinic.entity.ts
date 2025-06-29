import {
  Entity,
  ManyToOne,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { User } from '../../clinic-users/models/clinic-user.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity({ name: 'clinics' })
export class Clinic extends PostgresAbstractEntity<Clinic> {
  constructor(clinic?: Partial<Clinic>) {
    super();
    if (clinic) Object.assign(this, clinic);
  }

  @ManyToOne(() => User, (user) => user.ownerOf, { nullable: true })
  @JoinColumn()
  owner: User;

  @ManyToMany(() => User, (user) => user.clinics)
  users: User[]
}
