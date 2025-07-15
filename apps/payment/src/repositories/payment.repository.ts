import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { PostgresAbstractRepository } from '@app/common/databases/postgresql/abstract.repository';
import { Payment } from '../entities/payment.entity';
import { PaymentStatus, PaymentProvider } from '../enums';

interface PaymentStatsRaw {
  totalAmount: string;
  totalCount: string;
  successfulAmount: string;
  successfulCount: string;
  failedCount: string;
  pendingCount: string;
}

interface RevenueByProviderRaw {
  provider: string;
  amount: string;
  count: string;
}

@Injectable()
export class PaymentRepository extends PostgresAbstractRepository<Payment> {
  protected readonly logger = new Logger(PaymentRepository.name);

  constructor(
    @InjectRepository(Payment)
    paymentRepository: Repository<Payment>,
    entityManager: EntityManager,
  ) {
    super(paymentRepository, entityManager);
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    return this.findOne({ orderId });
  }

  async findByProviderTransactionId(
    providerTransactionId: string,
  ): Promise<Payment | null> {
    return this.findOne({ providerTransactionId });
  }

  async findByPatientId(patientId: string): Promise<Payment[]> {
    return this.find({ patientId });
  }

  async findByClinicId(clinicId: string): Promise<Payment[]> {
    return this.find({ clinicId });
  }

  async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    return this.find({ status });
  }

  async findByProvider(provider: PaymentProvider): Promise<Payment[]> {
    return this.find({ provider });
  }

  async findExpiredPayments(): Promise<Payment[]> {
    return this.createQueryBuilder('payment')
      .where('payment.status = :status', { status: PaymentStatus.PENDING })
      .andWhere('payment.expiredAt < :now', { now: new Date() })
      .getMany();
  }

  async getPaymentStatistics(
    startDate: Date,
    endDate: Date,
    clinicId?: string,
  ): Promise<{
    totalAmount: number;
    totalCount: number;
    successfulAmount: number;
    successfulCount: number;
    failedCount: number;
    pendingCount: number;
  }> {
    const query = this.createQueryBuilder('payment')
      .select([
        'COUNT(*) as totalCount',
        'SUM(payment.amount) as totalAmount',
        'COUNT(CASE WHEN payment.status = :successStatus THEN 1 END) as successfulCount',
        'SUM(CASE WHEN payment.status = :successStatus THEN payment.amount ELSE 0 END) as successfulAmount',
        'COUNT(CASE WHEN payment.status = :failedStatus THEN 1 END) as failedCount',
        'COUNT(CASE WHEN payment.status = :pendingStatus THEN 1 END) as pendingCount',
      ])
      .where('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .setParameters({
        successStatus: PaymentStatus.SUCCESS,
        failedStatus: PaymentStatus.FAILED,
        pendingStatus: PaymentStatus.PENDING,
      });

    if (clinicId) {
      query.andWhere('payment.clinicId = :clinicId', { clinicId });
    }

    const result: PaymentStatsRaw = await query.getRawOne();

    return {
      totalAmount: parseFloat(result?.totalAmount || '0') || 0,
      totalCount: parseInt(result?.totalCount || '0') || 0,
      successfulAmount: parseFloat(result?.successfulAmount || '0') || 0,
      successfulCount: parseInt(result?.successfulCount || '0') || 0,
      failedCount: parseInt(result?.failedCount || '0') || 0,
      pendingCount: parseInt(result?.pendingCount || '0') || 0,
    };
  }

  async getRevenueByProvider(
    startDate: Date,
    endDate: Date,
    clinicId?: string,
  ): Promise<
    Array<{ provider: PaymentProvider; amount: number; count: number }>
  > {
    const query = this.createQueryBuilder('payment')
      .select([
        'payment.provider as provider',
        'SUM(payment.amount) as amount',
        'COUNT(*) as count',
      ])
      .where('payment.status = :status', { status: PaymentStatus.SUCCESS })
      .andWhere('payment.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('payment.provider');

    if (clinicId) {
      query.andWhere('payment.clinicId = :clinicId', { clinicId });
    }

    const results: RevenueByProviderRaw[] = await query.getRawMany();

    return results.map((result) => ({
      provider: result.provider as PaymentProvider,
      amount: parseFloat(result.amount) || 0,
      count: parseInt(result.count) || 0,
    }));
  }
}
