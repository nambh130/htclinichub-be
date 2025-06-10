import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { EmployeeInfo } from './employeeInfo.entity';
import { Image } from './image.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity()
export class Specialize extends PostgresAbstractEntity<Specialize> {
  @Column()
  name: string;

  @Column()
  description: string;

  @OneToOne(() => EmployeeInfo, (employeeInfo) => employeeInfo.specializes)
  @JoinColumn({ name: 'employee_info_id' })
  employee_info: EmployeeInfo;

  @ManyToOne(() => Image)
  @JoinColumn({ name: 'image_id' })
  image: Image;
}
