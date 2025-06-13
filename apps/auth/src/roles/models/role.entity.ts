import {
  Entity,
  Column,
  ManyToMany,
  JoinTable
} from 'typeorm';
import { Permission } from '../../permissions/models/permission.entity';
import { PostgresAbstractEntity } from '@app/common';
import { ClinicUser } from '../../clinic-users/models/clinic-user.entity';

export enum RoleEnum {
  DOCTOR = 'doctor',
  EMPLOYEE = 'employee',
  ADMIN = 'admin',
}

export type RoleType = 'doctor' | 'employee' | 'admin'

@Entity()
export class Role extends PostgresAbstractEntity<Role> {
  constructor(role?: Partial<Role>) {
    super();
    if (role) Object.assign(this, role);
  }

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    name: 'role_type',
    type: 'enum',
    enum: RoleEnum
  })
  roleType: RoleType

  @ManyToMany(() => Permission, permission => permission.roles)
  @JoinTable({
    name: 'role_permission',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' }
  })
  permissions: Permission[];

  @ManyToMany(() => ClinicUser, (user) => user.roles)
  users: ClinicUser[]
}
