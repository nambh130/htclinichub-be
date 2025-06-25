import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Employee } from './employee.entity';
import { Role } from './role.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity()
export class EmployeeRoleLink extends PostgresAbstractEntity<EmployeeRoleLink> {
  @ManyToOne(() => Employee, (employee) => employee.roles)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @ManyToOne(() => Role, (role) => role.employee_links)
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
