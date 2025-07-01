import { PostgresAbstractEntity } from '@app/common';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { EmployeeRoleLink } from './employeeRoleLinks.entity';
import { StaffInfo } from './staffInfo.entity';

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

  @OneToOne(() => StaffInfo)
  @JoinColumn({ name: 'staff_info_id', referencedColumnName: 'id' })
  staffInfo: StaffInfo;
}
