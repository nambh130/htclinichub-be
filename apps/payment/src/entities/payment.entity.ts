import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import {
  PaymentMethod,
  PaymentStatus,
  PaymentType,
} from '../enums/payment-status.enum';
import { PaymentConfig } from './payment-config.entity';
import { PaymentTransaction } from './payment-transaction.entity';
import { WebhookEvent } from './webhook-event.entity';
import { PostgresAbstractEntity } from '@app/common';

@Entity('payment')
@Index(['clinicId'])
@Index(['appointmentId'])
@Index(['status'])
@Index(['providerPaymentId'])
export class Payment extends PostgresAbstractEntity<Payment> {
  @Column({ type: 'uuid' })
  clinicId: string;

  @Column({ type: 'uuid', nullable: true })
  appointmentId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'VND' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  paymentUrl?: string;

  @Column({ nullable: true })
  providerPaymentId?: string; // PayOS paymentLinkId

  @Column({ type: 'varchar', length: 100, nullable: true })
  orderCode?: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.BANKING,
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    patientId?: string;
    patientName?: string;
    patientEmail?: string;
    patientPhone?: string;
    description?: string;
    items?: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
      type: PaymentType;
      appointmentId?: string;
      labOrderItemId?: string;
      labOrderId?: string;
    }>;
    customFields?: Record<string, any>;
  };

  @Column({ type: 'jsonb', nullable: true })
  providerResponse?: Record<string, any>;

  @Column({ nullable: true })
  failureReason?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  refundedAmount?: number;

  @Column({ nullable: true })
  expiresAt?: Date;

  @ManyToOne(() => PaymentConfig, (credential) => credential.payments)
  @JoinColumn({ name: 'credentialId' })
  credential?: PaymentConfig;

  @Column({ type: 'uuid', nullable: true })
  credentialId?: string;

  @OneToMany(() => PaymentTransaction, (transaction) => transaction.payment)
  transactions?: PaymentTransaction[];

  @OneToMany(() => WebhookEvent, (event) => event.payment)
  webhookEvents?: WebhookEvent[];

  @Column({ nullable: true })
  completedAt?: Date;
}
