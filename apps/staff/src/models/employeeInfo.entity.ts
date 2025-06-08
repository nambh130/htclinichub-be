import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Image } from './image.entity';
import { Specialize } from './specialize.entity';
import { Degree } from './degree.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity()
export class EmployeeInfo extends PostgresAbstractEntity<EmployeeInfo> {
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

  @ManyToOne(() => Image)
  @JoinColumn({ name: 'image_id' })
  image: Image;

  @OneToOne(() => Specialize, (specialize) => specialize.employee_info)
  specializes: Specialize;

  @OneToOne(() => Degree, (degree) => degree.employee_info)
  degrees: Degree;
}
