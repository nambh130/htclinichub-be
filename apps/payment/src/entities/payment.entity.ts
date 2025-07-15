import { Entity, Column, OneToMany } from 'typeorm';
import { PostgresAbstractEntity } from '@app/common/databases/postgresql/abstract.entity';
import { PaymentStatus, PaymentProvider } from '../enums';
import { PaymentTransaction } from './payment-transaction.entity';

@Entity('payments')
export class Payment extends PostgresAbstractEntity<Payment> {
  @Column()
  orderId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentProvider,
  })
  provider: PaymentProvider;

  @Column({ nullable: true })
  providerId: string;

  @Column({ nullable: true })
  providerTransactionId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, unknown>;

  @Column({ nullable: true })
  patientId: string;

  @Column({ nullable: true })
  clinicId: string;

  @Column({ nullable: true })
  appointmentId: string;

  @Column({ nullable: true })
  returnUrl: string;

  @Column({ nullable: true })
  cancelUrl: string;

  @Column({ nullable: true })
  notifyUrl: string;

  @Column({ type: 'timestamp', nullable: true })
  expiredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @OneToMany(() => PaymentTransaction, (transaction) => transaction.payment)
  transactions: PaymentTransaction[];
}
