import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EmployeeInfo } from './employeeInfo.entity';

@Entity({ name: 'doctor_workshift' })
export class Doctor {
  @PrimaryGeneratedColumn({ name: 'shift_id' })
  id: number;

  @OneToOne(() => EmployeeInfo, (info) => info.doctor, {
    cascade: false,
    nullable: true,
  })
  employeeInfo?: EmployeeInfo;

  @Column()
  email: string;

  @Column()
  password: string;
}
