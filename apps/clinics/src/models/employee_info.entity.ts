import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Doctor } from './doctors.entity';

@Entity()
export class EmployeeInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullname: string;

  @Column({ type: 'date' })
  dob: Date;

  @Column()
  gender: string;

  @Column()
  specialization: string;

  @Column()
  degree: string;

  @Column()
  position: string;

  // image_id of image table in mongoDB
  @Column({ nullable: true })
  profile_pic: string;
}
