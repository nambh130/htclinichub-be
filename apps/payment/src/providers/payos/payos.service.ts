import { Injectable } from '@nestjs/common';
import PayOS from '@payos/node';
import { EncryptionService } from '../../encryption/encryption.service';
import { PaymentStatus } from '../../enums/payment-status.enum';
import { PayOSCredentials } from './payos.interface';
import {
  PaymentProvider,
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
  PaymentConfig,
} from '../base/payment-provider.interface';
import {
  PaymentRepository,
  PaymentTransactionRepository,
  WebhookEventRepository,
  PaymentConfigRepository,
} from '../../repositories';
import {
  Payment as PaymentEntity,
  PaymentConfig as PaymentConfigEntity,
  PaymentTransaction as PaymentTransactionEntity,
  WebhookEvent as WebhookEventEntity,
} from '../../entities';
import { CheckoutResponseDataType } from '@payos/node/lib/type';

// Import PayOS types for better type safety
import { WebhookType, WebhookDataType } from '@payos/node/lib/type';

@Injectable()
export class PayOSService implements PaymentProvider {
  constructor(
    private paymentRepository: PaymentRepository,
    private paymentConfigRepository: PaymentConfigRepository,
    private transactionRepository: PaymentTransactionRepository,
    private webhookEventRepository: WebhookEventRepository,
    private encryptionService: EncryptionService,
  ) {}

  /**
   * Configure webhook URL for PayOS
   */
  async configureWebhook(
    clinicId: string,
    webhookUrl: string,
  ): Promise<string> {
    // Get encrypted credentials
    const credentialEntity = await this.paymentConfigRepository.findOne({
      clinicId,
      provider: 'payos',
      isActive: true,
    });

    if (!credentialEntity) {
      throw new Error('PayOS credentials not found for this clinic');
    }

    // Decrypt credentials
    const credentials: Record<string, any> =
      this.encryptionService.decrypt<PayOSCredentials>(
        credentialEntity.encryptedCredentials,
      );

    let payos: PayOS | null = null;

    try {
      // Initialize PayOS client
      payos = new PayOS(
        credentials.clientId as string,
        credentials.apiKey as string,
        credentials.checksumKey as string,
      );

      // Configure webhook URL
      const result = await payos.confirmWebhook(webhookUrl);

      return result;
    } finally {
      // Clean up credentials from memory
      this.encryptionService.secureCleanup(credentials);
      payos = null;
    }
  }

  /**
   * Verify webhook signature for security
   */
  async verifyWebhookSignature(
    clinicId: string,
    webhookData: WebhookType,
  ): Promise<WebhookDataType> {
    // Get encrypted credentials
    const credentialEntity = await this.paymentConfigRepository.findOne({
      clinicId,
      provider: 'payos',
      isActive: true,
    });

    if (!credentialEntity) {
      throw new Error('PayOS credentials not found for this clinic');
    }

    // Decrypt credentials
    const credentials: Record<string, any> =
      this.encryptionService.decrypt<PayOSCredentials>(
        credentialEntity.encryptedCredentials,
      );

    let payos: PayOS | null = null;

    try {
      // Initialize PayOS client
      payos = new PayOS(
        credentials.clientId as string,
        credentials.apiKey as string,
        credentials.checksumKey as string,
      );

      // Verify webhook data and signature
      const verifiedData = payos.verifyPaymentWebhookData(webhookData);

      return verifiedData;
    } finally {
      // Clean up credentials from memory
      this.encryptionService.secureCleanup(credentials);
      payos = null;
    }
  }

  /**
   * Store encrypted PayOS credentials for a clinic
   */
  async storeCredentials(
    clinicId: string,
    credentials: PaymentConfig,
  ): Promise<void> {
    const payosCredentials = credentials;

    // Validate credentials
    if (
      !payosCredentials.clientId ||
      !payosCredentials.apiKey ||
      !payosCredentials.checksumKey
    ) {
      throw new Error('Missing required PayOS credentials');
    }

    // Encrypt credentials
    const encryptedCredentials =
      this.encryptionService.encrypt(payosCredentials);

    // Check if credentials already exist for this clinic and provider
    const existingCredential = await this.paymentConfigRepository.findOne({
      clinicId,
      provider: 'payos',
    });

    if (existingCredential) {
      // Update existing credentials
      await this.paymentConfigRepository.findOneAndUpdate(
        { clinicId, provider: 'payos' },
        {
          encryptedCredentials,
          isActive: true,
          updatedAt: new Date(),
        },
      );
    } else {
      // Create new credential record
      const newCredential = new PaymentConfigEntity();
      newCredential.clinicId = clinicId;
      newCredential.provider = 'payos';
      newCredential.encryptedCredentials = encryptedCredentials;
      newCredential.isActive = true;

      await this.paymentConfigRepository.create(newCredential);
    }

    // Clean up from memory
    this.encryptionService.secureCleanup(payosCredentials);
  }

  /**
   * Create payment link using PayOS
   */
  async createPaymentLink(
    request: CreatePaymentLinkRequest,
  ): Promise<CreatePaymentLinkResponse> {
    // Get encrypted credentials
    const credentialEntity = await this.paymentConfigRepository.findOne({
      clinicId: request.clinicId,
      provider: 'payos',
      isActive: true,
    });

    if (!credentialEntity) {
      throw new Error('PayOS credentials not found for this clinic');
    }

    // Create payment record first
    const payment = new PaymentEntity();
    payment.clinicId = request.clinicId;
    payment.appointmentId = request.appointmentId;
    payment.amount = request.amount;
    payment.currency = 'VND';
    payment.status = PaymentStatus.PENDING;
    payment.orderCode = request.orderCode;
    payment.credentialId = credentialEntity.id;
    payment.metadata = {
      patientName: request.buyerName,
      patientEmail: request.buyerEmail,
      patientPhone: request.buyerPhone,
      description: request.description,
      items: request.items,
    };
    payment.expiresAt = request.expiredAt
      ? new Date(request.expiredAt * 1000)
      : null;

    const savedPayment = await this.paymentRepository.create(payment);

    // Decrypt credentials
    const credentials: Record<string, any> =
      this.encryptionService.decrypt<PayOSCredentials>(
        credentialEntity.encryptedCredentials,
      );

    let payos: PayOS | null = null;
    let paymentLinkRes: CheckoutResponseDataType | null = null;

    try {
      // Initialize PayOS client
      payos = new PayOS(
        credentials.clientId as string,
        credentials.apiKey as string,
        credentials.checksumKey as string,
      );

      // Prepare payment request
      const paymentRequest = {
        orderCode: parseInt(request.orderCode),
        amount: request.amount,
        description: request.description,
        cancelUrl: request.cancelUrl,
        returnUrl: request.returnUrl,
        items: request.items,
        buyerName: request.buyerName,
        buyerEmail: request.buyerEmail,
        buyerPhone: request.buyerPhone,
        buyerAddress: request.buyerAddress,
        expiredAt: request.expiredAt,
      };

      // Create payment link
      paymentLinkRes = await payos.createPaymentLink(paymentRequest);

      // Convert PayOS response to Record<string, any> for database storage
      const providerResponseForDB =
        this.convertPayOSResponseToGeneric(paymentLinkRes);

      // Update payment record with provider response
      const _updatedPayment = await this.paymentRepository.findOneAndUpdate(
        { id: savedPayment.id },
        {
          providerPaymentId: paymentLinkRes.paymentLinkId,
          paymentUrl: paymentLinkRes.checkoutUrl,
          providerResponse: providerResponseForDB,
          updatedAt: new Date(),
        },
      );

      return {
        paymentId: savedPayment.id,
        paymentLinkId: paymentLinkRes.paymentLinkId,
        checkoutUrl: paymentLinkRes.checkoutUrl,
        qrCode: paymentLinkRes.qrCode,
        amount: paymentLinkRes.amount,
        orderCode: paymentLinkRes.orderCode.toString(),
        status: paymentLinkRes.status,
      };
    } catch (error) {
      // Update payment status to failed
      await this.paymentRepository.findOneAndUpdate(
        { id: savedPayment.id },
        {
          status: PaymentStatus.FAILED,
          failureReason:
            error instanceof Error ? error.message : 'Unknown error',
          updatedAt: new Date(),
        },
      );

      throw error;
    } finally {
      // Immediately clean up sensitive data from memory
      this.encryptionService.secureCleanup(credentials);

      // Clear local variables
      payos = null;
      paymentLinkRes = null;
    }
  }

  /**
   * Process webhook data from PayOS with proper verification
   */
  async processWebhook(webhookData: WebhookType): Promise<void> {
    // First, find the payment to get the clinic ID
    const payment = await this.paymentRepository.findOne({
      orderCode: webhookData.data.orderCode.toString(),
    });

    if (!payment) {
      throw new Error(
        'Payment not found for order code: ' + webhookData.data.orderCode,
      );
    }

    // Verify webhook signature for security
    let verifiedData: WebhookDataType;
    try {
      verifiedData = await this.verifyWebhookSignature(
        payment.clinicId,
        webhookData,
      );
    } catch (error) {
      throw new Error(
        'Webhook signature verification failed: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    }

    // Create webhook event record
    const webhookEvent = new WebhookEventEntity();
    webhookEvent.paymentId = payment.id;
    webhookEvent.eventType = this.determineEventType(verifiedData);
    webhookEvent.eventData = webhookData;
    webhookEvent.signature = webhookData.signature;
    webhookEvent.processed = false;

    const savedWebhookEvent =
      await this.webhookEventRepository.create(webhookEvent);

    try {
      // Update payment status based on verified webhook data
      if (this.isSuccessfulPayment(verifiedData)) {
        // Update payment to PAID status
        await this.paymentRepository.findOneAndUpdate(
          { id: payment.id },
          {
            status: PaymentStatus.PAID,
            completedAt: new Date(),
            updatedAt: new Date(),
          },
        );

        // Create transaction record with verified data
        const transaction = new PaymentTransactionEntity();
        transaction.paymentId = payment.id;
        transaction.reference = verifiedData.reference;
        transaction.amount = verifiedData.amount;
        transaction.accountNumber = verifiedData.accountNumber;
        transaction.description = verifiedData.description;
        transaction.transactionDateTime = new Date(
          verifiedData.transactionDateTime,
        );
        transaction.virtualAccountName = verifiedData.virtualAccountName;
        transaction.virtualAccountNumber = verifiedData.virtualAccountNumber;
        transaction.counterAccountBankId = verifiedData.counterAccountBankId;
        transaction.counterAccountBankName =
          verifiedData.counterAccountBankName;
        transaction.counterAccountName = verifiedData.counterAccountName;
        transaction.counterAccountNumber = verifiedData.counterAccountNumber;
        transaction.rawData = verifiedData;

        await this.transactionRepository.create(transaction);
      } else {
        // Update payment to FAILED status
        await this.paymentRepository.findOneAndUpdate(
          { id: payment.id },
          {
            status: PaymentStatus.FAILED,
            failureReason: verifiedData.desc,
            updatedAt: new Date(),
          },
        );
      }

      // Mark webhook as processed
      await this.webhookEventRepository.findOneAndUpdate(
        { id: savedWebhookEvent.id },
        {
          processed: true,
          processedAt: new Date(),
        },
      );
    } catch (error) {
      // Mark webhook as failed to process
      await this.webhookEventRepository.findOneAndUpdate(
        { id: savedWebhookEvent.id },
        {
          processed: false,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      );
      throw error;
    }
  }

  /**
   * Determine event type based on webhook data
   */
  private determineEventType(webhookData: WebhookDataType): string {
    if (webhookData.code === '00' && webhookData.desc === 'Thành công') {
      return 'payment.success';
    }
    return 'payment.failed';
  }

  /**
   * Check if payment is successful based on webhook data
   */
  private isSuccessfulPayment(webhookData: WebhookDataType): boolean {
    return webhookData.code === '00' && webhookData.desc === 'Thành công';
  }

  /**
   * Get payment by ID with relations
   */
  async getPaymentById(paymentId: string): Promise<PaymentEntity | null> {
    return this.paymentRepository.findOne({ id: paymentId }, [
      'transactions',
      'webhookEvents',
      'config',
    ]);
  }

  /**
   * Get payment by order code
   */
  async getPaymentByOrderCode(
    orderCode: string,
  ): Promise<PaymentEntity | null> {
    return this.paymentRepository.findOne({ orderCode });
  }

  /**
   * Get payments for a clinic with pagination
   */
  async getPaymentsByClinic(
    clinicId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: PaymentEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.paymentRepository.findAll({
      where: { clinicId },
      page,
      limit,
      order: { createdAt: 'DESC' },
      relations: {
        transactions: true,
        webhookEvents: true,
        credential: true,
      },
    });
  }

  /**
   * Cancel payment (if supported by provider)
   */
  async cancelPayment(paymentId: string, reason?: string): Promise<void> {
    const payment = await this.paymentRepository.findOne({ id: paymentId });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new Error('Can only cancel pending payments');
    }

    // Get credentials for PayOS API call
    const credentialEntity = await this.paymentConfigRepository.findOne({
      clinicId: payment.clinicId,
      provider: 'payos',
      isActive: true,
    });

    if (!credentialEntity) {
      throw new Error('PayOS credentials not found for this clinic');
    }

    const credentials: Record<string, any> =
      this.encryptionService.decrypt<PayOSCredentials>(
        credentialEntity.encryptedCredentials,
      );

    try {
      // Initialize PayOS client
      const payos = new PayOS(
        credentials.clientId as string,
        credentials.apiKey as string,
        credentials.checksumKey as string,
      );

      // Cancel payment link via PayOS API
      await payos.cancelPaymentLink(parseInt(payment.orderCode), reason);

      // Update payment status
      await this.paymentRepository.findOneAndUpdate(
        { id: paymentId },
        {
          status: PaymentStatus.CANCELLED,
          failureReason: reason || 'Payment cancelled by user',
          updatedAt: new Date(),
        },
      );
    } finally {
      // Clean up credentials from memory
      this.encryptionService.secureCleanup(credentials);
    }
  }

  /**
   * Helper method to convert PayOS response to generic format
   */
  private convertPayOSResponseToGeneric(
    payosResponse: CheckoutResponseDataType,
  ): Record<string, any> {
    return {
      bin: payosResponse.bin,
      accountNumber: payosResponse.accountNumber,
      accountName: payosResponse.accountName,
      amount: payosResponse.amount,
      description: payosResponse.description,
      orderCode: payosResponse.orderCode,
      currency: payosResponse.currency,
      paymentLinkId: payosResponse.paymentLinkId,
      status: payosResponse.status,
      checkoutUrl: payosResponse.checkoutUrl,
      qrCode: payosResponse.qrCode,
      ...(payosResponse.expiredAt && { expiredAt: payosResponse.expiredAt }),
    };
  }

  /**
   * Helper method to convert generic response back to PayOS format
   */
  private convertGenericResponseToPayOS(
    genericResponse: Record<string, any>,
  ): CheckoutResponseDataType {
    return {
      bin: genericResponse.bin as string,
      accountNumber: genericResponse.accountNumber as string,
      accountName: genericResponse.accountName as string,
      amount: genericResponse.amount as number,
      description: genericResponse.description as string,
      orderCode: genericResponse.orderCode as number,
      currency: genericResponse.currency as string,
      paymentLinkId: genericResponse.paymentLinkId as string,
      status: genericResponse.status as string,
      checkoutUrl: genericResponse.checkoutUrl as string,
      qrCode: genericResponse.qrCode as string,
      ...(genericResponse.expiredAt && {
        expiredAt: genericResponse.expiredAt as number,
      }),
    };
  }

  /**
   * Get PayOS-specific response from payment
   */
  async getPayOSResponse(
    paymentId: string,
  ): Promise<CheckoutResponseDataType | null> {
    const payment = await this.paymentRepository.findOne({ id: paymentId });

    if (!payment || !payment.providerResponse) {
      return null;
    }

    return this.convertGenericResponseToPayOS(payment.providerResponse);
  }
}
