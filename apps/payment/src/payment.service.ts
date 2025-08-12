import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayOSService } from './providers/payos/payos.service';
import { StorePayOSCredentialsDto } from './dtos/store-credentials.dto';
import { CreatePaymentLinkDto } from './dtos/create-payment-link.dto';
import { CreateCashPaymentDto } from './dtos/create-cash-payment.dto';
import { WebhookType } from '@payos/node/lib/type';
import { Payment } from './entities/payment.entity';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { GetPaymentsDto } from './dtos/get-payments.dto';
import { GetTransactionsDto } from './dtos/get-transactions.dto';
import { GetPaymentStatisticsDto } from './dtos/get-statistics.dto';
import { TokenPayload } from '@app/common';
import { PaymentConfig } from './entities/payment-config.entity';
import { PaymentMethod, PaymentStatus } from './enums/payment-status.enum';
import { setAudit } from '@app/common';

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

  /**
   * Cancel - Cancel a PayOS payment link
   */
  async cancelPayOSPayment(paymentId: string, reason: string): Promise<void> {
    return this.payosService.cancelPayment(paymentId, reason);
  }

  /**
   * Create - Create a new cash payment record
   */
  async createCashPayment(
    dto: CreateCashPaymentDto,
    currentUser: TokenPayload,
  ): Promise<Payment> {
    const payment = new Payment();
    payment.clinicId = dto.clinicId;
    payment.appointmentId = dto.appointmentId;
    payment.amount = dto.amount;
    payment.currency = 'VND';
    payment.status = PaymentStatus.PENDING;
    payment.paymentMethod = PaymentMethod.CASH;
    payment.metadata = {
      patientName: dto.buyerName,
      patientEmail: dto.buyerEmail,
      patientPhone: dto.buyerPhone,
      description: dto.description,
      items: dto.items,
      customFields: dto.notes ? { notes: dto.notes } : undefined,
    };

    setAudit(payment, currentUser);
    const savedPayment = await this.paymentRepository.save(payment);

    this.logger.log(
      `Cash payment created successfully: paymentId=${savedPayment.id}, clinicId=${dto.clinicId}`,
    );

    return savedPayment;
  }

  /**
   * Update - Mark cash payment as paid
   */
  async markCashPaymentAsPaid(
    paymentId: string,
    currentUser: TokenPayload,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error(`Payment with ID ${paymentId} not found`);
    }

    if (payment.paymentMethod !== PaymentMethod.CASH) {
      throw new Error(`Payment ${paymentId} is not a cash payment`);
    }

    if (payment.status === PaymentStatus.PAID) {
      throw new Error(`Payment ${paymentId} is already marked as paid`);
    }

    if (
      payment.status === PaymentStatus.CANCELLED ||
      payment.status === PaymentStatus.FAILED
    ) {
      throw new Error(
        `Cannot mark ${payment.status.toLowerCase()} payment as paid`,
      );
    }

    // Update payment status and completion time
    payment.status = PaymentStatus.PAID;
    payment.completedAt = new Date();

    // Update audit fields
    setAudit(payment, currentUser);

    const updatedPayment = await this.paymentRepository.save(payment);

    this.logger.log(
      `Cash payment marked as paid: paymentId=${paymentId}, clinicId=${payment.clinicId}`,
    );

    return updatedPayment;
  }

  /**
   * Update - Cancel cash payment and mark as failed
   */
  async cancelCashPayment(
    paymentId: string,
    reason: string,
    currentUser: TokenPayload,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error(`Payment ${paymentId} not found`);
    }

    if (payment.paymentMethod !== PaymentMethod.CASH) {
      throw new Error(`Payment ${paymentId} is not a cash payment`);
    }

    if (
      payment.status === PaymentStatus.CANCELLED ||
      payment.status === PaymentStatus.FAILED
    ) {
      throw new Error(
        `Payment ${paymentId} is already ${payment.status.toLowerCase()}`,
      );
    }

    if (payment.status === PaymentStatus.PAID) {
      throw new Error(`Cannot cancel already paid payment ${paymentId}`);
    }

    // Update payment status and add failure reason
    payment.status = PaymentStatus.FAILED;
    payment.failureReason = reason;

    // Update audit fields
    setAudit(payment, currentUser);

    const updatedPayment = await this.paymentRepository.save(payment);

    this.logger.log(
      `Cash payment cancelled: paymentId=${paymentId}, clinicId=${payment.clinicId}, reason=${reason}`,
    );

    return updatedPayment;
  }

  // ========================================
  // 🔄 WEBHOOK PROCESSING
  // ========================================

  /**
   * Configure - Register webhook URL with PayOS for a clinic
   */
  async configurePayOSWebhook(
    clinicId: string,
    webhookUrl: string,
  ): Promise<string> {
    return this.payosService.configureWebhook(clinicId, webhookUrl);
  }

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

  /**
   * Read - Get payment by ID for a specific clinic
   * @param clinicId - The clinic ID
   * @param paymentId - The payment ID
   * @returns Payment with related data or null if not found
   */
  async getPaymentById(
    clinicId: string,
    paymentId: string,
  ): Promise<Payment | null> {
    try {
      const payment = await this.paymentRepository
        .createQueryBuilder('payment')
        .leftJoinAndSelect('payment.credential', 'credential')
        .leftJoinAndSelect('payment.transactions', 'transactions')
        .leftJoinAndSelect('payment.webhookEvents', 'webhookEvents')
        .where('payment.id = :paymentId', { paymentId })
        .andWhere('payment.clinicId = :clinicId', { clinicId })
        .getOne();

      if (!payment) {
        this.logger.warn(
          `Payment not found: paymentId=${paymentId}, clinicId=${clinicId}`,
        );
        return null;
      }

      this.logger.log(
        `Payment retrieved successfully: paymentId=${paymentId}, clinicId=${clinicId}`,
      );
      return payment;
    } catch (error) {
      this.logger.error(
        `Error retrieving payment by ID: paymentId=${paymentId}, clinicId=${clinicId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Read - Get payment by appointment ID for a specific clinic
   * @param clinicId - The clinic ID
   * @param appointmentId - The appointment ID
   * @returns Payment with related data or null if not found
   */
  async getPaymentByAppointmentId(
    clinicId: string,
    appointmentId: string,
  ): Promise<Payment | null> {
    try {
      const payment = await this.paymentRepository
        .createQueryBuilder('payment')
        .leftJoinAndSelect('payment.credential', 'credential')
        .leftJoinAndSelect('payment.transactions', 'transactions')
        .leftJoinAndSelect('payment.webhookEvents', 'webhookEvents')
        .where('payment.appointmentId = :appointmentId', { appointmentId })
        .andWhere('payment.clinicId = :clinicId', { clinicId })
        .orderBy('payment.createdAt', 'DESC')
        .getOne();

      if (!payment) {
        this.logger.warn(
          `Payment not found: appointmentId=${appointmentId}, clinicId=${clinicId}`,
        );
        return null;
      }

      this.logger.log(
        `Payment retrieved successfully: appointmentId=${appointmentId}, clinicId=${clinicId}`,
      );
      return payment;
    } catch (error) {
      this.logger.error(
        `Error retrieving payment by appointment ID: appointmentId=${appointmentId}, clinicId=${clinicId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Read - Get ALL payments for a specific clinic and appointment
   * @param clinicId - The clinic ID
   * @param appointmentId - The appointment ID
   * @returns Array of payments with related data
   */
  async getAllPaymentsByAppointmentId(
    clinicId: string,
    appointmentId: string,
  ): Promise<Payment[]> {
    try {
      const payments = await this.paymentRepository
        .createQueryBuilder('payment')
        .leftJoinAndSelect('payment.credential', 'credential')
        .leftJoinAndSelect('payment.transactions', 'transactions')
        .leftJoinAndSelect('payment.webhookEvents', 'webhookEvents')
        .where('payment.appointmentId = :appointmentId', { appointmentId })
        .andWhere('payment.clinicId = :clinicId', { clinicId })
        .orderBy('payment.createdAt', 'DESC')
        .getMany();

      this.logger.log(
        `Found ${payments.length} payments for appointment ${appointmentId} in clinic ${clinicId}`,
      );

      return payments;
    } catch (error) {
      this.logger.error(
        `Error getting payments by appointment ID: appointmentId=${appointmentId}, clinicId=${clinicId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Read - Get all PAID payments for a specific clinic and appointment
   * @param clinicId - The clinic ID
   * @param appointmentId - The appointment ID
   * @returns Array of PAID payments with related data
   */
  async getPaidPaymentsByAppointmentId(
    clinicId: string,
    appointmentId: string,
  ): Promise<Payment[]> {
    try {
      const payments = await this.paymentRepository
        .createQueryBuilder('payment')
        .leftJoinAndSelect('payment.credential', 'credential')
        .leftJoinAndSelect('payment.transactions', 'transactions')
        .leftJoinAndSelect('payment.webhookEvents', 'webhookEvents')
        .where('payment.appointmentId = :appointmentId', { appointmentId })
        .andWhere('payment.clinicId = :clinicId', { clinicId })
        .andWhere('payment.status = :status', { status: PaymentStatus.PAID })
        .orderBy('payment.createdAt', 'DESC')
        .getMany();

      this.logger.log(
        `Found ${payments.length} PAID payments for appointment ${appointmentId} in clinic ${clinicId}`,
      );

      return payments;
    } catch (error) {
      this.logger.error(
        `Error getting PAID payments by appointment ID: appointmentId=${appointmentId}, clinicId=${clinicId}`,
        error,
      );
      throw error;
    }
  }
}
