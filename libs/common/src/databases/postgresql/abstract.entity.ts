import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';

// Define allowed actor types
export type ActorType = 'doctor' | 'employee' | 'patient' | 'admin';

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
    enum: ['doctor', 'employee', 'patient'],
    nullable: true,
  })
  createdByType: ActorType;

  @Column({ nullable: true })
  updatedById: string;

  @Column({
    type: 'enum',
    enum: ['doctor', 'employee', 'patient'],
    nullable: true,
  })
  updatedByType: ActorType;
}
