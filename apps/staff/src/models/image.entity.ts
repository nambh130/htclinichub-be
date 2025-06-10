import { PostgresAbstractEntity } from '@app/common';
import { Column, Entity } from 'typeorm';

@Entity()
export class Image extends PostgresAbstractEntity<Image> {
  @Column()
  name: string;

  @Column()
  url: string;

  @Column()
  domain: string;
}
