import { PrimaryGeneratedColumn } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class PostgresAbstractEntity<T> {
  @PrimaryGeneratedColumn()
  id: number;

  // constructor(entity: Partial<T>) {
  //   Object.assign(this, entity);
  // }
}
