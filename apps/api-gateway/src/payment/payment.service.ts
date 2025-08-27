import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PATIENT_SERVICE, PAYMENT_SERVICE } from '@app/common';
import { firstValueFrom } from 'rxjs';
import {
  StorePayOSCredentialsDto,
  CreatePaymentLinkDto,
  CreateCashPaymentDto,
  GetPaymentsDto,
  GetTransactionsDto,
  GetPaymentStatisticsDto,
} from './payment.types';
import { WebhookType } from '@payos/node/lib/type';
import { TokenPayload } from '@app/common';

interface Payment {
  id: string;
  appointmentId?: string;
  [key: string]: any;
}

interface PaymentResponse {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
  [key: string]: any;
}

interface AppointmentResponse {
  data?: any;
  [key: string]: any;
}

@Injectable()
export class PaymentService {
  constructor(
    @Inject(PAYMENT_SERVICE) private readonly paymentHttpService: HttpService,
    @Inject(PATIENT_SERVICE) private readonly patientHttpService: HttpService,
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
   * Remove - Remove entire PayOS payment configuration for a clinic
   * This includes deleting credentials, canceling active payments, and cleanup
   */
  async removePayOSConfiguration(
    clinicId: string,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.delete(
        `/payments/payos/configuration/${clinicId}`,
        {
          data: { currentUser },
        },
      ),
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

  /**
   * Cancel - Cancel a PayOS payment link
   */
  async cancelPayOSPayment(
    paymentId: string,
    reason: string,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.put(`/payments/payos/link/${paymentId}/cancel`, {
        reason,
        currentUser,
      }),
    );
    return response.data;
  }

  /**
   * Create - Create a new cash payment record
   */
  async createCashPayment(
    dto: CreateCashPaymentDto,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.post('/payments/cash', {
        dto,
        currentUser,
      }),
    );
    return response.data;
  }

  /**
   * Update - Mark cash payment as paid
   */
  async markCashPaymentAsPaid(
    paymentId: string,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.put(`/payments/cash/${paymentId}/paid`, {
        currentUser,
      }),
    );
    return response.data;
  }

  /**
   * Update - Cancel cash payment and mark as failed
   */
  async cancelCashPayment(
    paymentId: string,
    reason: string,
    currentUser: TokenPayload,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.put(`/payments/cash/${paymentId}/cancel`, {
        reason,
        currentUser,
      }),
    );
    return response.data;
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
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.post('/payments/payos/webhook/configure', {
        clinicId,
        webhookUrl,
      }),
    );
    return response.data;
  }

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
    // Extract searchType for API Gateway filtering (don't pass to payment service)
    const { searchType, ...paymentServiceQuery } = query;

    // If searchType is 'doctor', remove search term from payment service query
    // (we'll apply it as a second filter after fetching all payments)
    if (searchType === 'doctor') {
      const { search, ...queryWithoutSearch } = paymentServiceQuery;
      console.log(
        'Doctor search: fetching all payments, will filter by doctor name later',
      );

      const response = await firstValueFrom(
        this.paymentHttpService.get(`/payments/clinic/${clinicId}`, {
          params: queryWithoutSearch,
        }),
      );

      const data = response.data as PaymentResponse;

      // If there are payments, populate appointment details for each payment
      if (
        data.payments &&
        Array.isArray(data.payments) &&
        data.payments.length > 0
      ) {
        try {
          // Fetch appointment details for all payments concurrently
          const paymentsWithAppointments = await Promise.all(
            data.payments.map(async (payment: Payment) => {
              if (payment.appointmentId) {
                try {
                  // Use the patient HTTP service to get simplified appointment details
                  const appointmentResponse = await firstValueFrom(
                    this.patientHttpService.get(
                      `/patient-service/appointment/${payment.appointmentId}/simplified`,
                    ),
                  );

                  const appointmentData =
                    appointmentResponse.data as AppointmentResponse;

                  // Add appointment data to the payment object
                  return {
                    ...payment,
                    appointment:
                      (appointmentData.data as any) || appointmentData,
                  };
                } catch (error) {
                  console.error(
                    `Error fetching appointment ${payment.appointmentId}:`,
                    error,
                  );
                  // Return payment without appointment data if there's an error
                  return {
                    ...payment,
                    appointment: null,
                  };
                }
              }
              return payment;
            }),
          );

          // Apply doctor name filtering using the search term
          if (query.search && query.search.trim()) {
            const searchTerm = query.search.trim().toLowerCase();
            console.log('Filtering by doctor name:', searchTerm);

            const filteredPayments = paymentsWithAppointments.filter(
              (payment) => {
                if (payment.appointment?.doctorName) {
                  const doctorName =
                    payment.appointment.doctorName.toLowerCase();
                  return doctorName.includes(searchTerm);
                }
                return false;
              },
            );

            console.log('Total payments:', paymentsWithAppointments.length);
            console.log(
              'Filtered payments by doctor name:',
              filteredPayments.length,
            );

            return {
              ...data,
              payments: filteredPayments,
              total: filteredPayments.length,
            };
          }

          return {
            ...data,
            payments: paymentsWithAppointments,
            total: paymentsWithAppointments.length,
          };
        } catch (error) {
          console.error('Error populating appointment details:', error);
          return data;
        }
      }

      return data;
    } else {
      // Normal search behavior: pass search term to payment service
      console.log('Normal search: passing search term to payment service');

      const response = await firstValueFrom(
        this.paymentHttpService.get(`/payments/clinic/${clinicId}`, {
          params: paymentServiceQuery,
        }),
      );

      const data = response.data as PaymentResponse;

      // If there are payments, populate appointment details for each payment
      if (
        data.payments &&
        Array.isArray(data.payments) &&
        data.payments.length > 0
      ) {
        try {
          // Fetch appointment details for all payments concurrently
          const paymentsWithAppointments = await Promise.all(
            data.payments.map(async (payment: Payment) => {
              if (payment.appointmentId) {
                try {
                  // Use the patient HTTP service to get simplified appointment details
                  const appointmentResponse = await firstValueFrom(
                    this.patientHttpService.get(
                      `/patient-service/appointment/${payment.appointmentId}/simplified`,
                    ),
                  );

                  const appointmentData =
                    appointmentResponse.data as AppointmentResponse;

                  // Add appointment data to the payment object
                  return {
                    ...payment,
                    appointment:
                      (appointmentData.data as any) || appointmentData,
                  };
                } catch (error) {
                  console.error(
                    `Error fetching appointment ${payment.appointmentId}:`,
                    error,
                  );
                  // Return payment without appointment data if there's an error
                  return {
                    ...payment,
                    appointment: null,
                  };
                }
              }
              return payment;
            }),
          );

          return {
            ...data,
            payments: paymentsWithAppointments,
            total: data.total, // Keep original total from payment service
          };
        } catch (error) {
          console.error('Error populating appointment details:', error);
          return data;
        }
      }

      return data;
    }
  }

  /**
   * Read - Get a specific payment by ID for a clinic
   */
  async getPaymentById(clinicId: string, paymentId: string): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.get(
        `/payments/clinic/${clinicId}/payment/${paymentId}`,
      ),
    );
    return response.data;
  }

  /**
   * Read - Get payment by appointment ID for a specific clinic
   */
  async getPaymentByAppointmentId(
    clinicId: string,
    appointmentId: string,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.get(
        `/payments/clinic/${clinicId}/appointment/${appointmentId}`,
      ),
    );
    return response.data;
  }

  /**
   * Read - Get ALL payments for a specific clinic and appointment
   */
  async getAllPaymentsByAppointmentId(
    clinicId: string,
    appointmentId: string,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.get(
        `/payments/clinic/${clinicId}/appointment/${appointmentId}/all`,
      ),
    );
    return response.data;
  }

  /**
   * Read - Get all PAID payments for a specific clinic and appointment
   */
  async getPaidPaymentsByAppointmentId(
    clinicId: string,
    appointmentId: string,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.get(
        `/payments/clinic/${clinicId}/appointment/${appointmentId}/paid`,
      ),
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

  /**
   * Read - Get comprehensive payment analytics for a clinic
   */
  async getPaymentAnalytics(
    clinicId: string,
    period: string,
    customStartDate?: string,
    customEndDate?: string,
  ): Promise<unknown> {
    const response = await firstValueFrom(
      this.paymentHttpService.get(`/payments/clinic/${clinicId}/analytics`, {
        params: {
          period,
          customStartDate,
          customEndDate,
        },
      }),
    );
    return response.data;
  }
}
