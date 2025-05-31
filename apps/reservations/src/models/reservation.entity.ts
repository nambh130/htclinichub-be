import { PostgresAbstractEntity } from '@app/common';
import { Column, Entity } from 'typeorm';

@Entity()
export class Reservation extends PostgresAbstractEntity<Reservation> {
  @Column({ type: 'timestamp', nullable: false })
  timestamp: Date;

  @Column()
  userId: string;

  @Column()
  placeId: string;
}
