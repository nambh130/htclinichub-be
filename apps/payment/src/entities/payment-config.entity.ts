import { Entity, Column, Index, OneToMany } from 'typeorm';
import { Payment } from './payment.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity('payment_config')
@Index(['clinicId', 'provider'], { unique: true })
export class PaymentConfig extends PostgresAbstractEntity<PaymentConfig> {
  @Column({ type: 'uuid' })
  clinicId: string;

  @Column({ type: 'varchar', length: 50 })
  provider: string; // 'payos', 'stripe', etc.

  @Column({ type: 'text' })
  encryptedCredentials: string; // JSON string of encrypted credentials

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Payment, (payment) => payment.credential)
  payments: Payment[];
}
