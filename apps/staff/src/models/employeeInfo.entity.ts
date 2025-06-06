import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';

@Entity({ name: 'employee_info' })
export class EmployeeInfo {
  @PrimaryGeneratedColumn({ name: 'employee_info_id' })
  id: number;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column()
  dob: Date;

  @Column()
  phone: string;

  @Column()
  gender: string;

  @Column()
  specialize: string;

  @Column()
  degree: string;

  @Column()
  position: string;

  @Column({ name: 'profile_pic' })
  profilePicture: string;

  @OneToOne(() => Doctor, { nullable: false })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;
}
