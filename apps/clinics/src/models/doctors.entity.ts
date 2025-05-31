import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Clinic } from './clinics.entity';
import { EmployeeInfo } from './employee_info.entity';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 255 })
  password: string;

  // Một bác sĩ sở hữu nhiều phòng khám
  @OneToMany(() => Clinic, (clinic) => clinic.owner)
  ownedClinics: Clinic[];

  // Nhiều-nhiều: bác sĩ làm việc tại nhiều phòng khám
  @ManyToMany(() => Clinic, (clinic) => clinic.doctors)
  @JoinTable({
    name: 'doctor_clinic', // tên bảng liên kết
    joinColumn: { name: 'doctor_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'clinic_id', referencedColumnName: 'id' },
  })
  clinics: Clinic[];

  // Quan hệ 1-1 với EmployeeInfo, cột khóa ngoại là employee_info_id
  @OneToOne(() => EmployeeInfo, { cascade: true })
  @JoinColumn({ name: 'employee_info_id' })
  employeeInfo: EmployeeInfo;
}
