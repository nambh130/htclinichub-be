import { ActorType } from '@app/common';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  DeleteDateColumn,
} from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export abstract class PostgresAbstractEntity<T> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdById: string;

  @Column({
    type: 'enum',
    enum: ['doctor', 'employee', 'patient', 'admin'],
    nullable: true,
  })
  createdByType: ActorType;

  @Column({ nullable: true })
  updatedById: string;

  @Column({
    type: 'enum',
    enum: ['doctor', 'employee', 'patient', 'admin'],
    nullable: true,
  })
  updatedByType: ActorType;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @Column({ nullable: true })
  deletedById?: string;

  @Column({
    type: 'enum',
    enum: ['doctor', 'employee', 'patient'],
    nullable: true,
  })
  deletedByType?: ActorType;
}
