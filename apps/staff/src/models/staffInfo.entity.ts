import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Image } from './image.entity';
import { Specialize } from './specialize.entity';
import { Degree } from './degree.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity()
export class StaffInfo extends PostgresAbstractEntity<StaffInfo> {
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
}
