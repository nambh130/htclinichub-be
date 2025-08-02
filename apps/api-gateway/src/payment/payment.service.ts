import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PAYMENT_SERVICE } from '@app/common';
import { firstValueFrom } from 'rxjs';
import {
  StorePayOSCredentialsDto,
  CreatePaymentLinkDto,
  GetPaymentsDto,
  GetTransactionsDto,
  GetPaymentStatisticsDto,
} from './payment.types';
import { WebhookType } from '@payos/node/lib/type';
import { TokenPayload } from '@app/common';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(PAYMENT_SERVICE) private readonly paymentHttpService: HttpService,
  ) {}

  // ========================================
  // 🔐 PAYOS CREDENTIAL MANAGEMENT (CRUD)
  // ========================================

  /**
   * Create - Store new PayOS credentials for a clinic
   */
  async storePayOSCredentials(
    dto: StorePayOSCredentialsDto,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.post('/payments/payos/credentials', {
        dto,
        currentUser,
      }),
    );
    return response.data;
  }

  /**
   * Read - Get PayOS credentials status for a clinic
   */
  async getPayOSCredentialsStatus(clinicId: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.get(
        `/payments/payos/credentials/${clinicId}/status`,
      ),
    );
    return response.data;
  }

  /**
   * Read - Get and decrypt PayOS credentials for a clinic
   */
  async getPayOSCredentials(clinicId: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.get(`/payments/payos/credentials/${clinicId}`),
    );
    return response.data;
  }

  /**
   * Update - Update existing PayOS credentials
   */
  async updatePayOSCredentials(
    dto: StorePayOSCredentialsDto,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.put('/payments/payos/credentials', {
        dto,
        currentUser,
      }),
    );
    return response.data;
  }

  /**
   * Update - Activate PayOS credentials for a clinic
   */
  async activatePayOSCredentials(
    clinicId: string,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.put(
        `/payments/payos/credentials/${clinicId}/activate`,
        {
          dto: { clinicId },
          currentUser,
        },
      ),
    );
    return response.data;
  }

  /**
   * Update - Deactivate PayOS credentials for a clinic
   */
  async deactivatePayOSCredentials(
    clinicId: string,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.put(
        `/payments/payos/credentials/${clinicId}/deactivate`,
        {
          dto: { clinicId },
          currentUser,
        },
      ),
    );
    return response.data;
  }

  /**
   * Delete - Permanently delete PayOS credentials for a clinic
   */
  async deletePayOSCredentials(clinicId: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.delete(`/payments/payos/credentials/${clinicId}`),
    );
    return response.data;
  }

  /**
   * Test - Test PayOS credentials by creating and canceling a test payment
   */
  async testPayOSCredentials(
    clientId: string,
    apiKey: string,
    checksumKey: string,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.post('/payments/payos/credentials/test', {
        clientId,
        apiKey,
        checksumKey,
      }),
    );
    return response.data;
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
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.post('/payments/payos/link', {
        dto,
        currentUser,
      }),
    );
    return response.data;
  }

  // ========================================
  // 🔄 WEBHOOK PROCESSING
  // ========================================

  /**
   * Process - Handle incoming webhooks from PayOS
   */
  async processPayOSWebhook(webhookData: WebhookType): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.post('/payments/payos/webhook', webhookData),
    );
    return response.data;
  }

  // ========================================
  // 🏥 GENERAL PAYMENT MANAGEMENT
  // ========================================

  /**
   * Read - Get all payment configurations for a clinic (provider-agnostic)
   */
  async getAllPaymentConfigs(clinicId: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.get(`/payments/clinic/${clinicId}/configs`),
    );
    return response.data;
  }

  /**
   * Read - Get all payments for a clinic with filtering and pagination
   */
  async getPaymentsByClinic(
    clinicId: string,
    query: GetPaymentsDto,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.get(`/payments/clinic/${clinicId}`, {
        params: query,
      }),
    );
    return response.data;
  }

  /**
   * Read - Get all transactions for a clinic with filtering and pagination
   */
  async getTransactionsByClinic(
    clinicId: string,
    query: GetTransactionsDto,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.get(`/payments/clinic/${clinicId}/transactions`, {
        params: query,
      }),
    );
    return response.data;
  }

  /**
   * Read - Get payment statistics and analytics for a clinic
   */
  async getPaymentStatistics(
    clinicId: string,
    query: GetPaymentStatisticsDto,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.get(`/payments/clinic/${clinicId}/statistics`, {
        params: query,
      }),
    );
    return response.data;
  }
}
