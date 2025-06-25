import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EmployeeInfo } from './employeeInfo.entity';

@Entity({ name: 'doctor_workshift' })
export class Doctor_ {
  @PrimaryGeneratedColumn({ name: 'shift_id' })
  id: number;

 
}
