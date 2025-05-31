import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { Doctor } from './doctors.entity';

@Entity()
export class Clinic {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ length: 500 })
  name: string;

  @Column({ length: 500 })
  location: string;

  // FK: Mỗi phòng khám thuộc 1 bác sĩ (chủ sở hữu)
  @ManyToOne(() => Doctor, (doctor) => doctor.ownedClinics, { nullable: true })
  @JoinColumn({ name: 'ownerId' })
  owner: Doctor;

  @Column({ nullable: true })
  ownerId: string;

  // Nhiều-nhiều: nhiều bác sĩ làm việc tại nhiều phòng khám
  @ManyToMany(() => Doctor, (doctor) => doctor.clinics)
  doctors: Doctor[];
}
