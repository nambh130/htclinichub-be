import {
  Entity,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  Unique,
} from 'typeorm';
import { PostgresAbstractEntity } from '@app/common';
import { Clinic } from '../../clinics/models/clinic.entity';
import { Role } from '../../roles/models/role.entity';
import { AccountStatus, AccountStatusType } from '@app/common/enum/account-type.enum';

export enum ActorEnum {
  DOCTOR = "doctor",
  EMPLOYEE = "employee",
  PATIENT = "patient"
}

export type ActorType = "doctor" | "employee" | "patient"

@Entity({ name: 'clinic_users' })
@Unique(['email', 'actorType'])
export class ClinicUser extends PostgresAbstractEntity<ClinicUser> {
  constructor(user?: Partial<ClinicUser>) {
    super();
    if (user) Object.assign(this, user);
  }

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ name: "actor_type",
    type: 'enum',
    enum: ActorEnum
  })
  actorType: ActorType

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.ACTIVE })
  status: AccountStatusType;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: {name: 'user_id', referencedColumnName: 'id'},
    inverseJoinColumn: {name: 'permission_id', referencedColumnName: 'id'},
  })
  roles: Role[];

  @OneToMany(() => Clinic, (clinic) => clinic.owner)
  ownerOf: Clinic[];

  @ManyToMany(() => Clinic, (clinic) => clinic.owner, { cascade: true })
  @JoinTable({
    name: 'user_clinics',
    joinColumn: {name: 'user_id', referencedColumnName: 'id'},
    inverseJoinColumn: {name: 'clinic_id', referencedColumnName: 'id'},
  })
  clinics: Clinic[];
}
