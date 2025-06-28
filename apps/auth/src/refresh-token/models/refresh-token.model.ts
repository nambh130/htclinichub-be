import { PostgresAbstractEntity } from '@app/common';
import {
  Entity,
  Column,
} from 'typeorm';

@Entity('refresh_tokens')
export class RefreshToken extends PostgresAbstractEntity<RefreshToken> {
  @Column({ name: "user_id" })
  userId: string;

  @Column({ name: "token_hash" })
  tokenHash: string;

  @Column({ nullable: true, name: "user_agent" })
  userAgent: string;

  @Column({ nullable: true, name: "ip_address" })
  ipAddress: string;

  @Column({ name: "expire_at" })
  expiresAt: Date;
}
