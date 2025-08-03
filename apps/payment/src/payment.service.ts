import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayOSService } from './providers/payos/payos.service';
import { StorePayOSCredentialsDto } from './dtos/store-credentials.dto';
import { CreatePaymentLinkDto } from './dtos/create-payment-link.dto';
import { WebhookType } from '@payos/node/lib/type';
import { Payment } from './entities/payment.entity';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { GetPaymentsDto } from './dtos/get-payments.dto';
import { GetTransactionsDto } from './dtos/get-transactions.dto';
import { GetPaymentStatisticsDto } from './dtos/get-statistics.dto';
import { TokenPayload } from '@app/common';
import { PaymentConfig } from './entities/payment-config.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly payosService: PayOSService,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentTransaction)
    private readonly transactionRepository: Repository<PaymentTransaction>,
    @InjectRepository(PaymentConfig)
    private readonly paymentConfigRepository: Repository<PaymentConfig>,
  ) {}

  // ========================================
  // 🔐 PAYOS CREDENTIAL MANAGEMENT (CRUD)
  // ========================================

  /**
   * Create - Store PayOS credentials for a clinic
   */
  async storePayOSCredentials(
    dto: StorePayOSCredentialsDto,
    currentUser: TokenPayload,
  ): Promise<void> {
    await this.payosService.storeCredentials(
      dto.clinicId,
      {
        clientId: dto.clientId,
        apiKey: dto.apiKey,
        checksumKey: dto.checksumKey,
      },
      currentUser,
    );
  }

  /**
   * Read - Get the status of PayOS credentials for a clinic
   */
  async getPayOSCredentialsStatus(clinicId: string): Promise<{
    exists: boolean;
    isActive: boolean;
    lastUpdated?: Date;
  }> {
    return this.payosService.getCredentialsStatus(clinicId);
  }

  /**
   * Read - Get PayOS credentials for a clinic (decrypted)
   */
  async getPayOSCredentials(clinicId: string): Promise<{
    clientId: string;
    apiKey: string;
    checksumKey: string;
    isActive: boolean;
    lastUpdated?: Date;
  }> {
    return this.payosService.getCredentials(clinicId);
  }

  /**
   * Update - Update PayOS credentials for a clinic
   */
  async updatePayOSCredentials(
    dto: StorePayOSCredentialsDto,
    currentUser: TokenPayload,
  ): Promise<void> {
    await this.payosService.updateCredentials(
      dto.clinicId,
      {
        clientId: dto.clientId,
        apiKey: dto.apiKey,
        checksumKey: dto.checksumKey,
      },
      currentUser,
    );
  }

  /**
   * Update - Activate PayOS credentials for a clinic
   */
  async activatePayOSCredentials(
    clinicId: string,
    currentUser: TokenPayload,
  ): Promise<void> {
    await this.payosService.activateCredentials(clinicId, currentUser);
  }

  /**
   * Update - Deactivate PayOS credentials for a clinic
   */
  async deactivatePayOSCredentials(
    clinicId: string,
    currentUser: TokenPayload,
  ): Promise<void> {
    await this.payosService.deactivateCredentials(clinicId, currentUser);
  }

  /**
   * Delete - Delete PayOS credentials for a clinic
   */
  async deletePayOSCredentials(clinicId: string): Promise<void> {
    await this.payosService.deleteCredentials(clinicId);
  }

  /**
   * Test - Test PayOS credentials by creating and canceling a test payment
   */
  async testPayOSCredentials(
    clientId: string,
    apiKey: string,
    checksumKey: string,
  ): Promise<{
    success: boolean;
    message: string;
    checkoutUrl?: string;
    paymentLinkId?: string;
    error?: string;
  }> {
    return this.payosService.testCredentials(clientId, apiKey, checksumKey);
  }

  // ========================================
  // 💳 PAYMENT LINK MANAGEMENT
  // ========================================

  /**
   * Create - Create a new payment link using PayOS
   */
  async createPayOSPaymentLink(
    dto: CreatePaymentLinkDto,
    currentUser: TokenPayload,
  ) {
    return this.payosService.createPaymentLink(dto, currentUser);
  }

  // ========================================
  // 🔄 WEBHOOK PROCESSING
  // ========================================

  /**
   * Process - Handle incoming webhooks from PayOS
   */
  async processPayOSWebhook(webhookData: WebhookType): Promise<void> {
    // Process webhook from PayOS
    await this.payosService.processWebhook(webhookData);
  }

  // ========================================
  // 🏥 GENERAL PAYMENT MANAGEMENT
  // ========================================

  /**
   * Read - Get all payment configurations for a clinic (provider-agnostic)
   */
  async getAllPaymentConfigs(clinicId: string): Promise<unknown[]> {
    const configs = await this.paymentConfigRepository.find({
      where: { clinicId },
    });

    return configs.map((config) => ({
      id: config.id,
      provider: config.provider,
      isActive: config.isActive,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    }));
  }

  /**
   * Read - Get all payments for a specific clinic
   * @param clinicId - The clinic ID
   * @param dto - Query parameters for filtering and pagination
   * @returns Array of payments with their related data
   */
  async getPaymentsByClinic(
    clinicId: string,
    dto: GetPaymentsDto,
  ): Promise<{
    payments: Payment[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.credential', 'credential')
      .leftJoinAndSelect('payment.transactions', 'transactions')
      .where('payment.clinicId = :clinicId', { clinicId });

    // Apply filters
    if (dto.status) {
      queryBuilder.andWhere('payment.status = :status', { status: dto.status });
    }

    if (dto.startDate) {
      queryBuilder.andWhere('payment.createdAt >= :startDate', {
        startDate: new Date(dto.startDate),
      });
    }

    if (dto.endDate) {
      queryBuilder.andWhere('payment.createdAt <= :endDate', {
        endDate: new Date(dto.endDate),
      });
    }

    if (dto.minAmount) {
      queryBuilder.andWhere('payment.amount >= :minAmount', {
        minAmount: dto.minAmount,
      });
    }

    if (dto.maxAmount) {
      queryBuilder.andWhere('payment.amount <= :maxAmount', {
        maxAmount: dto.maxAmount,
      });
    }

    if (dto.search) {
      queryBuilder.andWhere(
        '(payment.orderCode ILIKE :search OR payment.providerPaymentId ILIKE :search OR payment.metadata::text ILIKE :search)',
        { search: `%${dto.search}%` },
      );
    }

    // Apply sorting
    const sortBy = dto.sortBy || 'createdAt';
    const sortOrder = dto.sortOrder || 'DESC';
    queryBuilder.orderBy(`payment.${sortBy}`, sortOrder);

    // Apply pagination
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const offset = (page - 1) * limit;

    queryBuilder.skip(offset).take(limit);

    // Get total count for pagination
    const totalQueryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.clinicId = :clinicId', { clinicId });

    // Apply same filters to count query
    if (dto.status) {
      totalQueryBuilder.andWhere('payment.status = :status', {
        status: dto.status,
      });
    }

    if (dto.startDate) {
      totalQueryBuilder.andWhere('payment.createdAt >= :startDate', {
        startDate: new Date(dto.startDate),
      });
    }

    if (dto.endDate) {
      totalQueryBuilder.andWhere('payment.createdAt <= :endDate', {
        endDate: new Date(dto.endDate),
      });
    }

    if (dto.minAmount) {
      totalQueryBuilder.andWhere('payment.amount >= :minAmount', {
        minAmount: dto.minAmount,
      });
    }

    if (dto.maxAmount) {
      totalQueryBuilder.andWhere('payment.amount <= :maxAmount', {
        maxAmount: dto.maxAmount,
      });
    }

    if (dto.search) {
      totalQueryBuilder.andWhere(
        '(payment.orderCode ILIKE :search OR payment.providerPaymentId ILIKE :search OR payment.metadata::text ILIKE :search)',
        { search: `%${dto.search}%` },
      );
    }

    const [payments, total] = await Promise.all([
      queryBuilder.getMany(),
      totalQueryBuilder.getCount(),
    ]);

    return {
      payments,
      total,
      page,
      limit,
    };
  }

  /**
   * Read - Get all transactions for a specific clinic
   * @param clinicId - The clinic ID
   * @param dto - Query parameters for filtering and pagination
   * @returns Array of transactions with their related payment data
   */
  async getTransactionsByClinic(
    clinicId: string,
    dto: GetTransactionsDto,
  ): Promise<{
    transactions: PaymentTransaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.payment', 'payment')
      .leftJoinAndSelect('payment.credential', 'credential')
      .where('payment.clinicId = :clinicId', { clinicId });

    // Apply filters
    if (dto.transactionType) {
      queryBuilder.andWhere('transaction.type = :transactionType', {
        transactionType: dto.transactionType,
      });
    }

    if (dto.startDate) {
      queryBuilder.andWhere('transaction.createdAt >= :startDate', {
        startDate: new Date(dto.startDate),
      });
    }

    if (dto.endDate) {
      queryBuilder.andWhere('transaction.createdAt <= :endDate', {
        endDate: new Date(dto.endDate),
      });
    }

    if (dto.minAmount) {
      queryBuilder.andWhere('transaction.amount >= :minAmount', {
        minAmount: dto.minAmount,
      });
    }

    if (dto.maxAmount) {
      queryBuilder.andWhere('transaction.amount <= :maxAmount', {
        maxAmount: dto.maxAmount,
      });
    }

    if (dto.search) {
      queryBuilder.andWhere(
        '(transaction.transactionId ILIKE :search OR transaction.providerTransactionId ILIKE :search OR transaction.description ILIKE :search)',
        { search: `%${dto.search}%` },
      );
    }

    // Apply sorting
    const sortBy = dto.sortBy || 'createdAt';
    const sortOrder = dto.sortOrder || 'DESC';
    queryBuilder.orderBy(`transaction.${sortBy}`, sortOrder);

    // Apply pagination
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const offset = (page - 1) * limit;

    queryBuilder.skip(offset).take(limit);

    // Get total count for pagination
    const totalQueryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.payment', 'payment')
      .where('payment.clinicId = :clinicId', { clinicId });

    // Apply same filters to count query
    if (dto.transactionType) {
      totalQueryBuilder.andWhere('transaction.type = :transactionType', {
        transactionType: dto.transactionType,
      });
    }

    if (dto.startDate) {
      totalQueryBuilder.andWhere('transaction.createdAt >= :startDate', {
        startDate: new Date(dto.startDate),
      });
    }

    if (dto.endDate) {
      totalQueryBuilder.andWhere('transaction.createdAt <= :endDate', {
        endDate: new Date(dto.endDate),
      });
    }

    if (dto.minAmount) {
      totalQueryBuilder.andWhere('transaction.amount >= :minAmount', {
        minAmount: dto.minAmount,
      });
    }

    if (dto.maxAmount) {
      totalQueryBuilder.andWhere('transaction.amount <= :maxAmount', {
        maxAmount: dto.maxAmount,
      });
    }

    if (dto.search) {
      totalQueryBuilder.andWhere(
        '(transaction.transactionId ILIKE :search OR transaction.providerTransactionId ILIKE :search OR transaction.description ILIKE :search)',
        { search: `%${dto.search}%` },
      );
    }

    const [transactions, total] = await Promise.all([
      queryBuilder.getMany(),
      totalQueryBuilder.getCount(),
    ]);

    return {
      transactions,
      total,
      page,
      limit,
    };
  }

  /**
   * Read - Get payment statistics for a clinic
   * @param clinicId - The clinic ID
   * @param dto - Query parameters for date range
   * @returns Payment statistics
   */
  async getPaymentStatistics(
    clinicId: string,
    dto: GetPaymentStatisticsDto,
  ): Promise<{
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    pendingPayments: number;
    totalRevenue: number;
    averageAmount: number;
  }> {
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.clinicId = :clinicId', { clinicId });

    if (dto.startDate) {
      queryBuilder.andWhere('payment.createdAt >= :startDate', {
        startDate: new Date(dto.startDate),
      });
    }

    if (dto.endDate) {
      queryBuilder.andWhere('payment.createdAt <= :endDate', {
        endDate: new Date(dto.endDate),
      });
    }

    const totalPayments = await queryBuilder.getCount();
    const successfulPayments = await queryBuilder
      .andWhere('payment.status = :status', { status: 'PAID' })
      .getCount();
    const failedPayments = await queryBuilder
      .andWhere('payment.status = :status', { status: 'FAILED' })
      .getCount();
    const pendingPayments = await queryBuilder
      .andWhere('payment.status = :status', { status: 'PENDING' })
      .getCount();

    const totalRevenueResult = await queryBuilder
      .andWhere('payment.status = :status', { status: 'PAID' })
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .getRawOne<{ total: string }>();

    const averageAmountResult = await queryBuilder
      .andWhere('payment.status = :status', { status: 'PAID' })
      .select('COALESCE(AVG(payment.amount), 0)', 'average')
      .getRawOne<{ average: string }>();

    return {
      totalPayments,
      successfulPayments,
      failedPayments,
      pendingPayments,
      totalRevenue: parseFloat(totalRevenueResult?.total || '0'),
      averageAmount: parseFloat(averageAmountResult?.average || '0'),
    };
  }
}
