import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { EmployeeInfo } from './employeeInfo.entity';
import { EmployeeRoleLink } from './employeeRoleLinks.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity()
export class Employee extends PostgresAbstractEntity<Employee> {
  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  clinic_id: number;

  @OneToOne(() => EmployeeInfo)
  @JoinColumn({ name: 'employee_info_id' })
  employee_info: EmployeeInfo;

  @OneToMany(() => EmployeeRoleLink, (link) => link.employee)
  roles: EmployeeRoleLink[];
}
