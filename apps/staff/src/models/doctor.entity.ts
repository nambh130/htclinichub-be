import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { EmployeeInfo } from './employeeInfo.entity';
import { Invitation } from './invitation.entity';
import { DoctorServiceLink } from './doctorServiceLinks.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity()
export class Doctor extends PostgresAbstractEntity<Doctor> {
  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  is_locked: boolean;

  @OneToOne(() => EmployeeInfo)
  @JoinColumn({ name: 'employee_info_id' })
  employee_info: EmployeeInfo;

  @OneToMany(() => Invitation, (invitation) => invitation.doctor)
  invitations: Invitation[];

  @OneToMany(() => DoctorServiceLink, (link) => link.doctor)
  services: DoctorServiceLink[];
}
