import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PostgresAbstractEntity } from '@app/common/databases/postgresql/abstract.entity';
import { PaymentStatus } from '../enums';
import { Payment } from './payment.entity';

@Entity('payment_transactions')
export class PaymentTransaction extends PostgresAbstractEntity<PaymentTransaction> {
  @Column()
  paymentId: string;

  @ManyToOne(() => Payment, (payment) => payment.transactions)
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;

  @Column()
  providerTransactionId: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
  })
  status: PaymentStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column()
  transactionType: string; // 'payment', 'refund', 'chargeback', etc.

  @Column({ type: 'json', nullable: true })
  providerResponse: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;
}
