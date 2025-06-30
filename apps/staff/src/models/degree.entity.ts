import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { StaffInfo } from './staffInfo.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity()
export class Degree extends PostgresAbstractEntity<Degree> {
  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => StaffInfo, (staffInfo) => staffInfo.specializes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'staff_info_id' })
  staff_info: StaffInfo;
  
  @Column({ name: 'image_id' })
  image_id: string;
}