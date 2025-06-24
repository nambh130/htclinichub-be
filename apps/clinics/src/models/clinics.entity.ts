import { PostgresAbstractEntity } from '@app/common';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Clinic extends PostgresAbstractEntity<Clinic>{
  //@PrimaryGeneratedColumn()
  //id: number;

  @Column({ length: 500 })
  name: string;

  @Column({ length: 500 })
  location: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ownerId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  token?: string;

  //@Column({ type: 'varchar', length: 255, nullable: true })
  //createdBy?: string;

  //@Column({ type: 'varchar', length: 255, nullable: true })
  //updatedBy?: string;

  //@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  //createdAt: Date;

  //@Column({
  //  type: 'timestamp',
  //  default: () => 'CURRENT_TIMESTAMP',
  //  onUpdate: 'CURRENT_TIMESTAMP',
  //})
  //updatedAt: Date;
}
