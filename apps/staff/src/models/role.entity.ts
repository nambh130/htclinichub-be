import { Column, Entity, OneToMany } from 'typeorm';
import { EmployeeRoleLink } from './employeeRoleLinks.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity()
export class Role extends PostgresAbstractEntity<Role> {
  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(() => EmployeeRoleLink, (link) => link.role)
  employee_links: EmployeeRoleLink[];
}
