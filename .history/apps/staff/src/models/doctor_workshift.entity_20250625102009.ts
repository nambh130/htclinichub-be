import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EmployeeInfo } from './employeeInfo.entity';

@Entity({ name: 'doctor_workshift' })
export class Doctor_Ư {
  @PrimaryGeneratedColumn({ name: 'shift_id' })
  id: number;

 
}
