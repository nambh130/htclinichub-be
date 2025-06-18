import {
  Entity,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { UserClinicLink } from './user-clinics-links.entity';
import { PostgresAbstractEntity } from '@app/common';
import { Clinic } from '../../clinics/models/clinic.entity';
import { Role } from '../../roles/models/role.entity';
import { Exclude } from 'class-transformer';

export enum ActorEnum {
  DOCTOR = "doctor",
  EMPLOYEE = "employee",
  PATIENT = "patient"
}

export type ActorType = "doctor" | "employee" | "patient"

@Entity({ name: 'clinic_users' })
export class ClinicUser extends PostgresAbstractEntity<ClinicUser> {
  constructor(user?: Partial<ClinicUser>) {
    super();
    if (user) Object.assign(this, user);
  }

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: "actor_type",
    type: 'enum',
    enum: ActorEnum
  })
  actorType: ActorType

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: {name: 'user_id', referencedColumnName: 'id'},
    inverseJoinColumn: {name: 'permission_id', referencedColumnName: 'id'},
  })
  roles: Role[];

  @OneToMany(() => Clinic, (clinic) => clinic.owner)
  clinics: Clinic[];

  @ManyToMany(() => Clinic, (clinic) => clinic.owner, { cascade: true })
  @JoinTable({
    name: 'user_clinics',
    joinColumn: {name: 'user_id', referencedColumnName: 'id'},
    inverseJoinColumn: {name: 'clinic_id', referencedColumnName: 'id'},
  })
  currentClinics: Clinic[];
}
