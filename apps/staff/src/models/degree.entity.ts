import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { StaffInfo } from './staffInfo.entity';
import { PostgresAbstractEntity } from '@app/common';
import { DegreeLevel } from '@app/common/enum';

@Entity()
export class Degree extends PostgresAbstractEntity<Degree> {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: DegreeLevel,
    enumName: 'degree_level',
    nullable: true,
  })
  level?: DegreeLevel | null;

  @Column({ nullable: true })
  institution?: string | null;

  @Column({ type: 'smallint', name: 'year', nullable: true })
  year?: number | null;

  @Column({ nullable: true })
  description?: string | null;

  @Column({ name: 'certificate_url', nullable: true })
  certificate_url?: string | null;

  @ManyToOne(() => StaffInfo, (staffInfo) => staffInfo.degrees, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'staff_info_id' })
  staff_info: StaffInfo;

  @Column({ name: 'image_id', nullable: true })
  image_id?: string | null;
}
