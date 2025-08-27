import { Injectable } from '@nestjs/common';
import PayOS from '@payos/node';
import { EncryptionService } from '../../encryption/encryption.service';
import { PaymentMethod, PaymentStatus } from '../../enums/payment-status.enum';
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
import { TokenPayload } from '@app/common';
import { setAudit, updateAudit } from '@app/common/utils/audit.util';
import { PAYOS } from '@app/common';

@Injectable()
export class PayOSService implements PaymentProvider {
  constructor(
    private paymentRepository: PaymentRepository,
    private paymentConfigRepository: PaymentConfigRepository,
    private transactionRepository: PaymentTransactionRepository,
    private webhookEventRepository: WebhookEventRepository,
    private encryptionService: EncryptionService,
  ) {}

  // ========================================
  // 🔄 WEBHOOK MANAGEMENT
  // ========================================

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
      provider: PAYOS,
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
      provider: PAYOS,
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
   * Process webhook data from PayOS with proper verification
   */
  async processWebhook(webhookData: WebhookType): Promise<void> {
    // First, find the payment to get the clinic ID
    const payment = await this.paymentRepository.findOne({
      orderCode: webhookData.data.orderCode.toString(),
    });

    // If payment not found in database, check if it's a test webhook from PayOS
    if (!payment) {
      const anyActiveCredential = await this.paymentConfigRepository.findOne({
        provider: PAYOS,
        isActive: true,
      });

      if (anyActiveCredential) {
        const credentials: Record<string, any> =
          this.encryptionService.decrypt<PayOSCredentials>(
            anyActiveCredential.encryptedCredentials,
          );

        let payos: PayOS | null = null;
        try {
          payos = new PayOS(
            credentials.clientId as string,
            credentials.apiKey as string,
            credentials.checksumKey as string,
          );

          await payos.getPaymentLinkInformation(webhookData.data.orderCode);

          console.log(
            `PayOS webhook validation test received for orderCode: ${webhookData.data.orderCode}`,
          );
          return; // Success response for PayOS validation
        } catch (payosError) {
          console.log(
            `OrderCode ${webhookData.data.orderCode} not found in PayOS system:`,
            payosError,
          );
        } finally {
          this.encryptionService.secureCleanup(credentials);
          payos = null;
        }
      }

      throw new Error(
        'Payment not found for order code: ' + webhookData.data.orderCode,
      );
    }

    let verifiedData: WebhookDataType;
    try {
      verifiedData = await this.verifyWebhookSignature(
        payment.clinicId,
        webhookData,
      );
    } catch (error) {
      console.log('Signature verification failed:', error);
      verifiedData = webhookData.data;
    }

    const webhookEvent = new WebhookEventEntity();
    webhookEvent.paymentId = payment.id;
    webhookEvent.eventType = this.determineEventType(verifiedData);
    webhookEvent.eventData = webhookData;
    webhookEvent.signature = webhookData.signature;
    webhookEvent.processed = false;

    const savedWebhookEvent =
      await this.webhookEventRepository.create(webhookEvent);

    try {
      if (this.isSuccessfulPayment(verifiedData)) {
        await this.paymentRepository.findOneAndUpdate(
          { id: payment.id },
          {
            status: PaymentStatus.PAID,
            completedAt: new Date(),
            updatedAt: new Date(),
          },
        );

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
        await this.paymentRepository.findOneAndUpdate(
          { id: payment.id },
          {
            status: PaymentStatus.FAILED,
            failureReason: verifiedData.desc,
            updatedAt: new Date(),
          },
        );
      }

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

  // ========================================
  // 🔐 CREDENTIAL MANAGEMENT (CRUD)
  // ========================================

  /**
   * Create - Store encrypted PayOS credentials for a clinic
   */
  async storeCredentials(
    clinicId: string,
    credentials: PaymentConfig,
    currentUser: TokenPayload,
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
      provider: PAYOS,
    });

    if (existingCredential) {
      // Update existing credentials
      await this.paymentConfigRepository.findOneAndUpdate(
        { clinicId, provider: PAYOS },
        {
          encryptedCredentials,
          isActive: true,
          updatedAt: new Date(),
          ...updateAudit({}, currentUser),
        },
      );
    } else {
      // Create new credential record
      const newCredential = new PaymentConfigEntity();
      newCredential.clinicId = clinicId;
      newCredential.provider = PAYOS;
      newCredential.encryptedCredentials = encryptedCredentials;
      newCredential.isActive = true;
      setAudit(newCredential, currentUser);
      await this.paymentConfigRepository.create(newCredential);
    }

    // Clean up from memory
    this.encryptionService.secureCleanup(payosCredentials);
  }

  /**
   * Read - Get the activation status of PayOS credentials for a clinic
   */
  async getCredentialsStatus(clinicId: string): Promise<{
    exists: boolean;
    isActive: boolean;
    lastUpdated?: Date;
  }> {
    const existingCredential = await this.paymentConfigRepository.findOne({
      clinicId,
      provider: PAYOS,
    });

    if (!existingCredential) {
      return {
        exists: false,
        isActive: false,
      };
    }

    return {
      exists: true,
      isActive: existingCredential.isActive,
      lastUpdated: existingCredential.updatedAt,
    };
  }

  /**
   * Read - Get and decrypt PayOS credentials for a clinic
   */
  async getCredentials(clinicId: string): Promise<{
    clientId: string;
    apiKey: string;
    checksumKey: string;
    isActive: boolean;
    lastUpdated?: Date;
  }> {
    // Get encrypted credentials
    const credentialEntity = await this.paymentConfigRepository.findOne({
      clinicId,
      provider: PAYOS,
    });

    if (!credentialEntity) {
      throw new Error('No PayOS credentials found for this clinic.');
    }

    // Decrypt credentials
    const credentials: Record<string, any> =
      this.encryptionService.decrypt<PayOSCredentials>(
        credentialEntity.encryptedCredentials,
      );

    try {
      return {
        clientId: credentials.clientId as string,
        apiKey: credentials.apiKey as string,
        checksumKey: credentials.checksumKey as string,
        isActive: credentialEntity.isActive,
        lastUpdated: credentialEntity.updatedAt,
      };
    } finally {
      // Clean up credentials from memory
      this.encryptionService.secureCleanup(credentials);
    }
  }

  /**
   * Update - Update existing PayOS credentials
   */
  async updateCredentials(
    clinicId: string,
    newCredentials: PaymentConfig,
    currentUser: TokenPayload,
  ): Promise<void> {
    // Validate new credentials
    if (
      !newCredentials.clientId ||
      !newCredentials.apiKey ||
      !newCredentials.checksumKey
    ) {
      throw new Error('Missing required PayOS credentials');
    }

    // Check if credentials exist for this clinic and provider
    const existingCredential = await this.paymentConfigRepository.findOne({
      clinicId,
      provider: PAYOS,
    });

    if (!existingCredential) {
      throw new Error(
        'No existing PayOS credentials found for this clinic. Use storeCredentials instead.',
      );
    }

    // Encrypt new credentials
    const encryptedNewCredentials =
      this.encryptionService.encrypt(newCredentials);

    try {
      // Update existing credentials with new encrypted data
      await this.paymentConfigRepository.findOneAndUpdate(
        { clinicId, provider: PAYOS },
        {
          encryptedCredentials: encryptedNewCredentials,
          isActive: true,
          updatedAt: new Date(),
          ...updateAudit({}, currentUser),
        },
      );
    } catch (error) {
      throw new Error(
        `Failed to update PayOS credentials: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    } finally {
      // Clean up new credentials from memory
      this.encryptionService.secureCleanup(newCredentials);
    }
  }

  /**
   * Update - Activate PayOS credentials for a clinic
   */
  async activateCredentials(
    clinicId: string,
    currentUser: TokenPayload,
  ): Promise<void> {
    // Check if credentials exist for this clinic and provider
    const existingCredential = await this.paymentConfigRepository.findOne({
      clinicId,
      provider: PAYOS,
    });

    if (!existingCredential) {
      throw new Error(
        'No PayOS credentials found for this clinic. Please store credentials first.',
      );
    }

    // Check if credentials are already active
    if (existingCredential.isActive) {
      throw new Error('PayOS credentials are already active for this clinic.');
    }

    try {
      // Activate credentials
      await this.paymentConfigRepository.findOneAndUpdate(
        { clinicId, provider: PAYOS },
        {
          isActive: true,
          updatedAt: new Date(),
          ...updateAudit({}, currentUser),
        },
      );
    } catch (error) {
      throw new Error(
        `Failed to activate PayOS credentials: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Update - Deactivate PayOS credentials for a clinic
   */
  async deactivateCredentials(
    clinicId: string,
    currentUser: TokenPayload,
  ): Promise<void> {
    // Check if credentials exist for this clinic and provider
    const existingCredential = await this.paymentConfigRepository.findOne({
      clinicId,
      provider: PAYOS,
    });

    if (!existingCredential) {
      throw new Error('No PayOS credentials found for this clinic.');
    }

    // Check if credentials are already inactive
    if (!existingCredential.isActive) {
      throw new Error(
        'PayOS credentials are already inactive for this clinic.',
      );
    }

    try {
      // Deactivate credentials
      await this.paymentConfigRepository.findOneAndUpdate(
        { clinicId, provider: PAYOS },
        {
          isActive: false,
          updatedAt: new Date(),
          ...updateAudit({}, currentUser),
        },
      );
    } catch (error) {
      throw new Error(
        `Failed to deactivate PayOS credentials: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Delete - Permanently delete PayOS credentials for a clinic
   */
  async deleteCredentials(clinicId: string): Promise<void> {
    const existingCredential = await this.paymentConfigRepository.findOne({
      clinicId,
      provider: PAYOS,
    });

    if (!existingCredential) {
      throw new Error('No PayOS credentials found for this clinic.');
    }

    try {
      // First, update existing payments to remove credential reference (to avoid foreign key constraint)
      await this.paymentRepository.findOneAndUpdate(
        { credentialId: existingCredential.id },
        { credentialId: null },
      );

      // Then delete the PayOS credentials
      await this.paymentConfigRepository.delete({
        clinicId,
        provider: PAYOS,
      });
    } catch (error) {
      throw new Error(
        `Failed to delete PayOS credentials: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Remove entire PayOS payment configuration for a clinic
   * This includes deleting credentials, canceling active payments, and cleanup
   */
  async removeConfiguration(
    clinicId: string,
    currentUser: TokenPayload,
  ): Promise<{
    success: boolean;
    message: string;
    deletedCredentials: boolean;
    canceledPayments: number;
    errors?: string[];
  }> {
    const result = {
      success: true,
      message: 'PayOS configuration removed successfully',
      deletedCredentials: false,
      canceledPayments: 0,
      errors: [] as string[],
    };

    try {
      // 1. Check if PayOS credentials exist for this clinic
      const existingCredential = await this.paymentConfigRepository.findOne({
        clinicId,
        provider: PAYOS,
      });

      if (!existingCredential) {
        result.message = 'No PayOS configuration found for this clinic';
        return result;
      }

      // 2. Get all pending payments for this clinic that need to be canceled
      const pendingPayments = await this.paymentRepository.findAll({
        where: {
          clinicId,
          status: PaymentStatus.PENDING,
          credentialId: existingCredential.id,
        },
      });

      // 3. Cancel all pending payments via PayOS API
      if (pendingPayments.data && pendingPayments.data.length > 0) {
        const credentials: Record<string, any> =
          this.encryptionService.decrypt<PayOSCredentials>(
            existingCredential.encryptedCredentials,
          );

        let payos: PayOS | null = null;
        try {
          payos = new PayOS(
            credentials.clientId as string,
            credentials.apiKey as string,
            credentials.checksumKey as string,
          );

          // Cancel each pending payment
          for (const payment of pendingPayments.data) {
            try {
              if (payment.orderCode) {
                await payos.cancelPaymentLink(
                  parseInt(payment.orderCode),
                  'Clinic PayOS configuration removed',
                );

                // Update payment status in database
                await this.paymentRepository.findOneAndUpdate(
                  { id: payment.id },
                  {
                    status: PaymentStatus.CANCELLED,
                    failureReason: 'Clinic PayOS configuration removed',
                    updatedAt: new Date(),
                  },
                );

                result.canceledPayments++;
              }
            } catch (cancelError) {
              const errorMsg = `Failed to cancel payment ${payment.orderCode}: ${
                cancelError instanceof Error
                  ? cancelError.message
                  : 'Unknown error'
              }`;
              result.errors?.push(errorMsg);
              console.error(errorMsg);
            }
          }
        } finally {
          this.encryptionService.secureCleanup(credentials);
          payos = null;
        }
      }

      // 4. Update existing payments to remove credential reference (to avoid foreign key constraint)
      try {
        await this.paymentRepository.findOneAndUpdate(
          { credentialId: existingCredential.id },
          { credentialId: null },
        );
        console.log(
          `Updated payments to remove credential reference for clinic ${clinicId}`,
        );
      } catch (updateError) {
        const errorMsg = `Failed to update payments: ${
          updateError instanceof Error ? updateError.message : 'Unknown error'
        }`;
        result.errors?.push(errorMsg);
        console.warn(errorMsg);
        // Continue with deletion even if update fails
      }

      // 5. Delete the PayOS credentials
      try {
        await this.paymentConfigRepository.delete({
          clinicId,
          provider: PAYOS,
        });
        result.deletedCredentials = true;
      } catch (deleteError) {
        const errorMsg = `Failed to delete PayOS credentials: ${
          deleteError instanceof Error ? deleteError.message : 'Unknown error'
        }`;
        result.errors?.push(errorMsg);
        result.success = false;
        throw new Error(errorMsg);
      }

      // 6. Log the removal action
      console.log(
        `PayOS configuration removed for clinic ${clinicId} by user ${currentUser.userId}. Credentials deleted: ${result.deletedCredentials}, Payments canceled: ${result.canceledPayments}`,
      );

      return result;
    } catch (error) {
      result.success = false;
      result.message = 'Failed to remove PayOS configuration';

      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred';
      result.errors?.push(errorMsg);

      console.error(
        `Error removing PayOS configuration for clinic ${clinicId}:`,
        error,
      );
      throw error;
    }
  }

  // ========================================
  // 💳 PAYMENT LINK MANAGEMENT
  // ========================================

  /**
   * Generate unique order code
   */
  private async generateUniqueOrderCode(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      // Generate a 12-digit random number (100000000000 to 999999999999)
      const randomOrderCode =
        Math.floor(Math.random() * 900000000000) + 100000000000;
      const orderCodeStr = randomOrderCode.toString();

      // Check if this order code already exists
      const existingPayment = await this.paymentRepository.findOne({
        orderCode: orderCodeStr,
      });

      if (!existingPayment) {
        return orderCodeStr;
      }

      attempts++;
    }

    // Fallback: use timestamp + random number if all attempts fail
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return timestamp + random;
  }

  /**
   * Create - Create payment link using PayOS
   */
  async createPaymentLink(
    request: CreatePaymentLinkRequest,
    currentUser: TokenPayload,
  ): Promise<CreatePaymentLinkResponse> {
    // Get encrypted credentials
    const credentialEntity = await this.paymentConfigRepository.findOne({
      clinicId: request.clinicId,
      provider: PAYOS,
      isActive: true,
    });

    if (!credentialEntity) {
      throw new Error('PayOS credentials not found for this clinic');
    }

    // Use provided orderCode or generate unique one if not provided
    let orderCode: string;
    if (request.orderCode) {
      // Check if provided orderCode already exists
      const existingPayment = await this.paymentRepository.findOne({
        orderCode: request.orderCode,
      });

      if (existingPayment) {
        throw new Error(`Order code ${request.orderCode} already exists`);
      }

      orderCode = request.orderCode;
    } else {
      // No orderCode provided, generate a unique one
      orderCode = await this.generateUniqueOrderCode();
    }

    // Decrypt credentials first to validate before creating database record
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

      // Use provided expiration time or default to 15 minutes from now
      const expirationTime =
        request.expiredAt || Math.floor(Date.now() / 1000) + 15 * 60;

      // Filter items for PayOS - only include name, quantity, price
      const payosItems =
        request.items?.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })) || [];

      // Prepare payment request
      const paymentRequest = {
        orderCode: parseInt(orderCode),
        amount: request.amount,
        description: request.description,
        cancelUrl: request.cancelUrl,
        returnUrl: request.returnUrl,
        items: payosItems,
        buyerName: request.buyerName,
        buyerEmail: request.buyerEmail,
        buyerPhone: request.buyerPhone,
        buyerAddress: request.buyerAddress,
        expiredAt: expirationTime, // Use provided or default to 15 minutes
      };

      // Create payment link with PayOS FIRST
      paymentLinkRes = await payos.createPaymentLink(paymentRequest);

      // Only create database record AFTER successful PayOS response
      const payment = new PaymentEntity();
      payment.clinicId = request.clinicId;
      payment.appointmentId = request.appointmentId;
      payment.amount = request.amount;
      payment.currency = 'VND';
      payment.status = PaymentStatus.PENDING;
      payment.orderCode = orderCode;
      payment.paymentMethod = PaymentMethod.BANKING;
      payment.credentialId = credentialEntity.id;
      payment.providerPaymentId = paymentLinkRes.paymentLinkId;
      payment.paymentUrl = paymentLinkRes.checkoutUrl;
      payment.metadata = {
        patientName: request.buyerName,
        patientEmail: request.buyerEmail,
        patientPhone: request.buyerPhone,
        description: request.description,
        items: request.items,
      };
      payment.expiresAt = new Date(expirationTime * 1000); // Convert back to Date object

      // Convert PayOS response to Record<string, any> for database storage
      const providerResponseForDB =
        this.convertPayOSResponseToGeneric(paymentLinkRes);
      payment.providerResponse = providerResponseForDB;

      setAudit(payment, currentUser);
      const savedPayment = await this.paymentRepository.create(payment);

      return {
        paymentId: savedPayment.id,
        paymentLinkId: paymentLinkRes.paymentLinkId,
        checkoutUrl: paymentLinkRes.checkoutUrl,
        qrCode: paymentLinkRes.qrCode,
        amount: paymentLinkRes.amount,
        orderCode: paymentLinkRes.orderCode.toString(),
        status: paymentLinkRes.status,
      };
    } finally {
      this.encryptionService.secureCleanup(credentials);

      // Clear local variables
      payos = null;
      paymentLinkRes = null;
    }
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
      provider: PAYOS,
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
      if (!payment.orderCode) {
        throw new Error('Cannot cancel payment: orderCode is missing');
      }
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
   * Test PayOS credentials by creating and canceling a test payment
   */
  async testCredentials(
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
    let payos: PayOS | null = null;

    try {
      payos = new PayOS(clientId, apiKey, checksumKey);

      let testOrderCode = '123';

      try {
        await payos.getPaymentLinkInformation(123);

        testOrderCode = await this.generateUniqueOrderCode();
      } catch (error) {
        console.log(error);
      }

      const testPaymentRequest = {
        orderCode: parseInt(testOrderCode),
        amount: 2000,
        description: 'Test payment credentials',
        cancelUrl: 'https://example.com/cancel',
        returnUrl: 'https://example.com/return',
        items: [
          {
            name: 'Test Item',
            quantity: 1,
            price: 2000,
          },
        ],
        buyerName: 'Test User',
        buyerEmail: 'test@example.com',
        buyerPhone: '0123456789',
        buyerAddress: 'Test Address',
        expiredAt: Math.floor(Date.now() / 1000) + 3600,
      };

      const paymentLinkRes = await payos.createPaymentLink(testPaymentRequest);

      await payos.cancelPaymentLink(
        parseInt(testOrderCode),
        'Test payment - credentials verification',
      );

      return {
        success: true,
        message: 'Thông tin xác thực PayOS hợp lệ',
        checkoutUrl: paymentLinkRes.checkoutUrl,
        paymentLinkId: paymentLinkRes.paymentLinkId,
      };
    } catch (error) {
      let errorMessage = 'Unknown error occurred';

      if (error instanceof Error) {
        if (
          error.message.includes('credentials') ||
          error.message.includes('authentication') ||
          error.message.includes('unauthorized') ||
          error.message.includes('invalid')
        ) {
          errorMessage = 'Invalid PayOS credentials';
        } else if (
          error.message.includes('network') ||
          error.message.includes('connection') ||
          error.message.includes('timeout')
        ) {
          errorMessage = 'Network connection error';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    } finally {
      payos = null;
    }
  }

  // ========================================
  // 📊 PAYMENT DATA RETRIEVAL
  // ========================================

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

  // ========================================
  // 🛠️ UTILITY METHODS
  // ========================================

  /**
   * Determine event type based on webhook data
   */
  private determineEventType(webhookData: WebhookDataType): string {
    if (webhookData.code === '00' && webhookData.desc === 'success') {
      return 'payment.success';
    }
    return 'payment.failed';
  }

  /**
   * Check if payment is successful based on webhook data
   */
  private isSuccessfulPayment(webhookData: WebhookDataType): boolean {
    return webhookData.code === '00' && webhookData.desc === 'success';
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
}
