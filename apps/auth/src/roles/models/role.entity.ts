import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { Permission } from '../../permissions/models/permission.entity';
import { PostgresAbstractEntity } from '@app/common';
import { User } from '../../clinic-users/models/clinic-user.entity';
import { ActorEnum, ActorType } from '@app/common/enum/actor-type';

export enum RoleEnum {
  DOCTOR = 'doctor',
  EMPLOYEE = 'employee',
  ADMIN = 'admin',
}

export type RoleType = 'doctor' | 'employee' | 'admin';

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
    enum: ActorEnum,
  })
  roleType: ActorType;

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permission',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
