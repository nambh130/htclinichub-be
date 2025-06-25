import { PostgresAbstractEntity } from '@app/common';
import { Column, Entity, OneToMany } from 'typeorm';
import { EmployeeRoleLink } from './employeeRoleLinks.entity';

@Entity()
export class Employee extends PostgresAbstractEntity<Employee> {
  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  clinic_id: string;

  @Column({ default: false })
  is_locked: boolean;

  @OneToMany(() => EmployeeRoleLink, (link) => link.employee)
  roles: EmployeeRoleLink[];
}
