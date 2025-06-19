// employee.entity.ts
import { Column, Entity, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { EmployeeRoleLink } from './employeeRoleLinks.entity';
import { StaffInfo } from './staffInfo.entity';
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

  @OneToMany(() => EmployeeRoleLink, (link) => link.employee)
  roles: EmployeeRoleLink[];

  @OneToOne(() => StaffInfo, (staffInfo) => staffInfo.employee, {
    cascade: true,
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'staff_info_id' })
  staff_info: StaffInfo;
}
