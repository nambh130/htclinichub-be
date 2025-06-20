import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { StaffInfo } from './staffInfo.entity';
import { EmployeeRoleLink } from './employeeRoleLinks.entity';
import { PostgresAbstractEntity } from '@app/common';

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

  @OneToOne(() => StaffInfo)
  @JoinColumn({ name: 'employee_info_id' })
  employee_info: StaffInfo;

  @OneToMany(() => EmployeeRoleLink, (link) => link.employee)
  roles: EmployeeRoleLink[];
}
