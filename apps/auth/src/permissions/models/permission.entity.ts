import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Role } from '../../roles/models/role.entity';
import { PostgresAbstractEntity } from '@app/common';
import { ClinicUser } from '../../clinic-users/models/clinic-user.entity';

@Entity()
export class Permission extends PostgresAbstractEntity<Permission>{
  constructor(permission?: Partial<Permission>) {
    super();
    if (permission) Object.assign(this, permission);
  }

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  // Only if user's actor_type is staff
  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];
}
