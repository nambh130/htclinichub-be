import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { EmployeeInfo } from './employeeInfo.entity';
import { Image } from './image.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity()
export class Degree extends PostgresAbstractEntity<Degree> {
  @Column()
  name: string;

  @Column()
  description: string;

  @OneToOne(() => EmployeeInfo, (employeeInfo) => employeeInfo.degrees)
  @JoinColumn({ name: 'employee_info_id' })
  employee_info: EmployeeInfo;

  @ManyToOne(() => Image)
  @JoinColumn({ name: 'image_id' })
  image: Image;
}
