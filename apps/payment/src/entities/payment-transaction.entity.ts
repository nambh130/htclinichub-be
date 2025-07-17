import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Payment } from './payment.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity('payment_transaction')
@Index(['reference'])
@Index(['transactionDateTime'])
export class PaymentTransaction extends PostgresAbstractEntity<PaymentTransaction> {
  @ManyToOne(() => Payment, (payment) => payment.transactions)
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;

  @Column({ type: 'uuid' })
  paymentId: string;

  @Column({ type: 'varchar', length: 100 })
  reference: string; // Provider transaction reference

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 100 })
  accountNumber: string; // Receiving account number

  @Column({ type: 'text' })
  description: string; // Transaction description

  @Column()
  transactionDateTime: Date;

  @Column({ nullable: true })
  virtualAccountName: string;

  @Column({ nullable: true })
  virtualAccountNumber: string;

  @Column({ nullable: true })
  counterAccountBankId: string;

  @Column({ nullable: true })
  counterAccountBankName: string;

  @Column({ nullable: true })
  counterAccountName: string;

  @Column({ nullable: true })
  counterAccountNumber: string;

  @Column({ type: 'jsonb', nullable: true })
  rawData: Record<string, any>; // Store raw transaction data from provider
}
