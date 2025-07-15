import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { PaymentProviderFactory } from './services/providers';
import { QRGeneratorService } from './services/qr-generator.service';
import { PaymentRepository } from './repositories/payment.repository';
import { Payment, PaymentTransaction } from './entities';
import {
  CreatePaymentDto,
  PaymentStatusDto,
  PaymentCallbackDto,
  PaymentListDto,
  GenerateQRCodeDto,
  QRCodeResponseDto,
} from './dto';
import { PaymentStatus, PaymentProvider } from './enums';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    @InjectRepository(PaymentTransaction)
    private readonly transactionRepository: Repository<PaymentTransaction>,
    private readonly providerFactory: PaymentProviderFactory,
    private readonly qrGeneratorService: QRGeneratorService,
  ) {}

  async createPayment(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentStatusDto> {
    this.logger.log(
      `Creating payment for provider: ${createPaymentDto.provider}`,
    );

    // Generate unique orderId if not provided
    const orderId =
      createPaymentDto.orderId ||
      `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record
    const payment = new Payment();
    payment.orderId = orderId;
    payment.amount = createPaymentDto.amount;
    payment.currency = createPaymentDto.currency || 'VND';
    payment.status = PaymentStatus.PENDING;
    payment.provider = createPaymentDto.provider;
    payment.description = createPaymentDto.description;
    payment.patientId = createPaymentDto.patientId;
    payment.clinicId = createPaymentDto.clinicId;
    payment.appointmentId = createPaymentDto.appointmentId;
    payment.returnUrl = createPaymentDto.returnUrl;
    payment.cancelUrl = createPaymentDto.cancelUrl;
    payment.notifyUrl = createPaymentDto.notifyUrl;
    payment.metadata = createPaymentDto.metadata;
    payment.expiredAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const savedPayment = await this.paymentRepository.create(payment);

    // Get payment provider and create payment
    const provider = this.providerFactory.getProvider(
      createPaymentDto.provider,
    );

    try {
      const providerResponse = await provider.createPayment(createPaymentDto);

      // Update payment with provider response
      const updateData = {
        providerId: providerResponse.externalPaymentId,
        providerTransactionId: providerResponse.externalPaymentId,
        metadata: {
          ...savedPayment.metadata,
          providerResponse: providerResponse.rawResponse as Record<
            string,
            unknown
          >,
          paymentUrl: providerResponse.paymentUrl,
          qrCodeUrl: providerResponse.qrCodeUrl,
          qrCodeData: providerResponse.qrCodeData,
        },
      };

      await this.paymentRepository.update(savedPayment, updateData);

      // Create transaction record
      await this.createTransaction(
        savedPayment.id,
        PaymentStatus.PENDING,
        providerResponse,
      );

      this.logger.log(`Payment created: ${savedPayment.id}`);
    } catch (error) {
      this.logger.error(`Payment creation failed: ${(error as Error).message}`);
      await this.paymentRepository.update(savedPayment, {
        status: PaymentStatus.FAILED,
      });
      throw error;
    }

    return this.mapToPaymentStatusDto(savedPayment);
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusDto> {
    this.logger.log(`Getting payment status for: ${paymentId}`);

    const payment = await this.paymentRepository.findOne({ id: paymentId });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Check with provider for latest status
    try {
      const provider = this.providerFactory.getProvider(payment.provider);
      const providerStatus = await provider.getPaymentStatus(
        payment.providerTransactionId || payment.id,
      );

      if (providerStatus.status !== payment.status) {
        await this.updatePaymentStatus(
          payment,
          providerStatus.status,
          providerStatus,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Failed to get status from provider: ${(error as Error).message}`,
      );
    }

    return this.mapToPaymentStatusDto(payment);
  }

  async getPayments(
    query: PaymentListDto,
  ): Promise<{ payments: PaymentStatusDto[]; total: number }> {
    this.logger.log('Getting payments list');

    const options = {
      where: {} as FindOptionsWhere<Payment>,
      page: query.page || 1,
      limit: query.limit || 20,
    };

    if (query.status) {
      options.where.status = query.status;
    }

    if (query.provider) {
      options.where.provider = query.provider;
    }

    if (query.patientId) {
      options.where.patientId = query.patientId;
    }

    if (query.clinicId) {
      options.where.clinicId = query.clinicId;
    }

    if (query.orderId) {
      options.where.orderId = query.orderId;
    }

    const result = await this.paymentRepository.findAll(options);

    return {
      payments: result.data.map((payment) =>
        this.mapToPaymentStatusDto(payment),
      ),
      total: result.total,
    };
  }

  async cancelPayment(paymentId: string): Promise<PaymentStatusDto> {
    this.logger.log(`Cancelling payment: ${paymentId}`);

    const payment = await this.paymentRepository.findOne({ id: paymentId });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be cancelled');
    }

    // Cancel with provider
    try {
      const provider = this.providerFactory.getProvider(payment.provider);
      const cancelResponse = await provider.cancelPayment(
        payment.providerTransactionId || payment.id,
      );

      // Update payment status
      await this.updatePaymentStatus(
        payment,
        PaymentStatus.CANCELLED,
        cancelResponse,
      );
    } catch (error) {
      this.logger.error(
        `Failed to cancel with provider: ${(error as Error).message}`,
      );
      // Update status anyway for local tracking
      await this.updatePaymentStatus(payment, PaymentStatus.CANCELLED, {
        message: 'Cancelled locally',
      });
    }

    this.logger.log(`Payment cancelled: ${payment.id}`);

    return this.mapToPaymentStatusDto(payment);
  }

  async generateQRCode(
    generateQRDto: GenerateQRCodeDto,
  ): Promise<QRCodeResponseDto> {
    this.logger.log(
      `Generating QR code for payment: ${generateQRDto.paymentId}`,
    );

    const payment = await this.paymentRepository.findOne({
      id: generateQRDto.paymentId,
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.qrGeneratorService.generatePaymentQRCode(generateQRDto);
  }

  async handleWebhook(
    provider: PaymentProvider,
    webhookData: Record<string, any>,
  ): Promise<void> {
    this.logger.log(`Handling webhook from provider: ${provider}`);

    try {
      const paymentProvider = this.providerFactory.getProvider(provider);
      const callbackData = await paymentProvider.handleWebhook(webhookData);

      await this.processPaymentCallback(callbackData);
    } catch (error) {
      this.logger.error(
        `Webhook processing failed: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  private async processPaymentCallback(
    callbackData: PaymentCallbackDto,
  ): Promise<void> {
    this.logger.log(
      `Processing payment callback for: ${callbackData.paymentId}`,
    );

    const payment =
      (await this.paymentRepository.findOne({
        id: callbackData.paymentId,
      })) ||
      (await this.paymentRepository.findByProviderTransactionId(
        callbackData.externalPaymentId || '',
      ));

    if (!payment) {
      this.logger.warn(
        `Payment not found for callback: ${callbackData.paymentId}`,
      );
      return;
    }

    await this.updatePaymentStatus(payment, callbackData.status, callbackData);
    this.logger.log(`Payment callback processed for: ${payment.id}`);
  }

  private async updatePaymentStatus(
    payment: Payment,
    newStatus: PaymentStatus,
    responseData?: any,
  ): Promise<void> {
    const previousStatus = payment.status;

    const updateData: Partial<Payment> = {
      status: newStatus,
    };

    switch (newStatus) {
      case PaymentStatus.SUCCESS:
        updateData.paidAt = new Date();
        break;
      case PaymentStatus.FAILED:
        if (
          (responseData as PaymentCallbackDto)?.errorMessage ||
          (responseData as PaymentCallbackDto)?.message
        ) {
          updateData.metadata = {
            ...payment.metadata,
            failureReason:
              (responseData as PaymentCallbackDto)?.errorMessage ||
              (responseData as PaymentCallbackDto)?.message,
          };
        }
        break;
      case PaymentStatus.CANCELLED:
        // No additional fields needed for cancelled status
        break;
    }

    await this.paymentRepository.update(payment, updateData);
    await this.createTransaction(
      payment.id,
      newStatus,
      responseData,
      previousStatus,
    );

    // TODO: Add event handling/notification system
    this.logger.log(
      `Payment status updated from ${previousStatus} to ${newStatus} for payment: ${payment.id}`,
    );
  }

  private async createTransaction(
    paymentId: string,
    status: PaymentStatus,
    responseData?: any,
    previousStatus?: PaymentStatus,
  ): Promise<void> {
    const transaction = new PaymentTransaction();
    transaction.paymentId = paymentId;
    transaction.providerTransactionId =
      (responseData as PaymentCallbackDto)?.externalPaymentId ||
      (responseData as PaymentCallbackDto)?.transactionId ||
      `TXN-${Date.now()}`;
    transaction.status = status;
    transaction.amount = (responseData as PaymentCallbackDto)?.amount || 0;
    transaction.currency =
      (responseData as PaymentCallbackDto)?.currency || 'VND';
    transaction.transactionType = this.getTransactionType(
      status,
      previousStatus,
    );
    transaction.providerResponse = responseData as Record<string, unknown>;
    transaction.description = (responseData as PaymentCallbackDto)?.message;
    transaction.metadata = {
      previousStatus,
      errorCode: (responseData as PaymentCallbackDto)?.errorCode,
      errorMessage: (responseData as PaymentCallbackDto)?.errorMessage,
    };
    transaction.processedAt = new Date();

    await this.transactionRepository.save(transaction);
  }

  private getTransactionType(
    status: PaymentStatus,
    _previousStatus?: PaymentStatus,
  ): string {
    if (status === PaymentStatus.SUCCESS) return 'payment';
    if (status === PaymentStatus.FAILED) return 'failed_payment';
    if (status === PaymentStatus.CANCELLED) return 'cancellation';
    if (status === PaymentStatus.REFUNDED) return 'refund';
    return 'status_change';
  }

  private mapToPaymentStatusDto(payment: Payment): PaymentStatusDto {
    return {
      id: payment.id,
      orderId: payment.orderId,
      externalPaymentId: payment.providerTransactionId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      provider: payment.provider,
      description: payment.description,
      paymentUrl: payment.metadata?.paymentUrl as string,
      qrCodeUrl: payment.metadata?.qrCodeUrl as string,
      expiresAt: payment.expiredAt,
      paidAt: payment.paidAt,
      failureReason: payment.metadata?.failureReason as string,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  getHello(): string {
    return 'Payment Service is running!';
  }
}
