// staffInfo.entity.ts
import { Column, Entity, JoinColumn, OneToOne, ManyToOne } from 'typeorm';
import { Image } from './image.entity';
import { Specialize } from './specialize.entity';
import { Degree } from './degree.entity';
import { Doctor } from './doctor.entity';
import { Employee } from './employee.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity()
export class StaffInfo extends PostgresAbstractEntity<StaffInfo> {
  @Column()
  staff_id: string;

  @Column()
  full_name: string;

  @Column({ type: 'date' })
  dob: Date;

  @Column()
  phone: string;

  @Column()
  gender: string;

  @Column()
  position: string;

  @ManyToOne(() => Image, { nullable: true })
  @JoinColumn({ name: 'image_id' })
  image?: Image;

  @OneToOne(() => Specialize, (specialize) => specialize.employee_info, {
    nullable: true,
  })
  @JoinColumn({ name: 'specialize_id' })
  specializes?: Specialize;

  @OneToOne(() => Degree, (degree) => degree.employee_info, { nullable: true })
  @JoinColumn({ name: 'degree_id' })
  degrees?: Degree;

  @OneToOne(() => Doctor, (doctor) => doctor.staff_info, { nullable: true })
  doctor?: Doctor;

  @OneToOne(() => Employee, (employee) => employee.staff_info, {
    nullable: true,
  })
  employee?: Employee;
}
