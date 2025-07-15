import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as querystring from 'querystring';
import {
  PaymentProviderInterface,
  PaymentResponse,
  PaymentStatusResponse,
} from './payment-provider.interface';
import { CreatePaymentDto, PaymentCallbackDto } from '../../dto';
import { PaymentStatus } from '../../enums';

@Injectable()
export class OnepayProvider implements PaymentProviderInterface {
  private readonly logger = new Logger(OnepayProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async createPayment(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponse> {
    this.logger.log(
      `Creating OnePay payment for amount: ${createPaymentDto.amount}`,
    );

    try {
      // OnePay configuration
      const merchantId = this.configService.get('ONEPAY_MERCHANT_ID');
      const accessCode = this.configService.get('ONEPAY_ACCESS_CODE');
      const secureSecret = this.configService.get('ONEPAY_SECURE_SECRET');
      const apiUrl =
        this.configService.get('ONEPAY_API_URL') ||
        'https://mtf.onepay.vn/paygate/vpcpay.op';

      if (!merchantId || !accessCode || !secureSecret) {
        throw new Error('OnePay configuration missing');
      }

      // Build payment parameters (OnePay uses VPC format)
      const vpcParams: Record<string, string> = {
        vpc_Version: '2',
        vpc_Command: 'pay',
        vpc_Merchant: merchantId,
        vpc_AccessCode: accessCode,
        vpc_Amount: (createPaymentDto.amount * 100).toString(), // Convert to cents
        vpc_Currency: 'VND',
        vpc_MerchTxnRef: createPaymentDto.orderId,
        vpc_OrderInfo:
          createPaymentDto.description ||
          `Payment for order ${createPaymentDto.orderId}`,
        vpc_ReturnURL:
          createPaymentDto.returnUrl ||
          `${this.configService.get('BASE_URL')}/payment/return`,
        vpc_Locale: 'vn',
        vpc_TicketNo: this.getClientIP(), // Client IP
        vpc_Customer_Id: createPaymentDto.patientId || 'guest',
        vpc_Customer_Email: 'customer@clinic.com', // In real app, get from patient data
        vpc_Customer_Phone: '0901234567', // In real app, get from patient data
      };

      // Add healthcare-specific info to order info
      if (createPaymentDto.patientId || createPaymentDto.clinicId) {
        vpcParams.vpc_OrderInfo += ` - Patient: ${createPaymentDto.patientId || 'N/A'} - Clinic: ${createPaymentDto.clinicId || 'N/A'}`;
      }

      // Generate secure hash
      const secureHash = this.generateOnePayHash(vpcParams, secureSecret);
      vpcParams.vpc_SecureHash = secureHash;

      // Build payment URL
      const paymentUrl = `${apiUrl}?${querystring.stringify(vpcParams)}`;

      // OnePay doesn't have built-in QR, but we can generate one for the payment URL
      const qrCodeData = this.generateOnePayQRData(createPaymentDto);

      this.logger.log(
        `OnePay payment URL generated for order: ${createPaymentDto.orderId}`,
      );

      return {
        externalPaymentId: createPaymentDto.orderId,
        paymentUrl,
        qrCodeUrl: paymentUrl, // Same URL for QR
        qrCodeData,
        status: PaymentStatus.PENDING,
        message: 'Payment URL generated successfully',
        rawResponse: vpcParams,
      };
    } catch (error) {
      this.logger.error(
        `OnePay payment creation failed: ${(error as Error).message}`,
      );
      throw new Error(
        `OnePay payment creation failed: ${(error as Error).message}`,
      );
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    this.logger.log(`Getting OnePay payment status for: ${paymentId}`);

    try {
      // OnePay Query API
      const merchantId = this.configService.get('ONEPAY_MERCHANT_ID');
      const accessCode = this.configService.get('ONEPAY_ACCESS_CODE');
      const secureSecret = this.configService.get('ONEPAY_SECURE_SECRET');
      const queryUrl =
        this.configService.get('ONEPAY_QUERY_URL') ||
        'https://mtf.onepay.vn/paygate/vpcpay.op';

      const queryParams = {
        vpc_Version: '2',
        vpc_Command: 'queryDR',
        vpc_Merchant: merchantId,
        vpc_AccessCode: accessCode,
        vpc_MerchTxnRef: paymentId,
        vpc_User: 'op01',
        vpc_Password: 'op123456', // This would be configured
      };

      const secureHash = this.generateOnePayHash(queryParams, secureSecret);
      queryParams.vpc_SecureHash = secureHash;

      // In real implementation, make HTTP request to OnePay
      // const response = await this.httpService.post(queryUrl, queryParams).toPromise();

      // Mock response for demonstration
      const mockResponse = {
        vpc_Command: 'queryDR',
        vpc_MerchTxnRef: paymentId,
        vpc_Merchant: merchantId,
        vpc_Amount: '50000000',
        vpc_TxnResponseCode: '0', // 0 = success
        vpc_TransactionNo: '1234567890',
        vpc_Message: 'Approved',
        vpc_DRExists: 'Y',
        vpc_AcqResponseCode: '00',
      };

      const status = this.mapOnePayStatusToPaymentStatus(
        mockResponse.vpc_TxnResponseCode,
      );

      return {
        status,
        externalPaymentId: paymentId,
        amount: parseFloat(mockResponse.vpc_Amount) / 100,
        currency: 'VND',
        message:
          status === PaymentStatus.SUCCESS
            ? 'Payment successful'
            : 'Payment failed',
        rawResponse: mockResponse,
      };
    } catch (error) {
      this.logger.error(
        `OnePay status check failed: ${(error as Error).message}`,
      );
      return {
        status: PaymentStatus.FAILED,
        externalPaymentId: paymentId,
        message: `Status check failed: ${(error as Error).message}`,
        rawResponse: { error: (error as Error).message },
      };
    }
  }

  async cancelPayment(paymentId: string): Promise<PaymentResponse> {
    this.logger.log(`Cancelling OnePay payment: ${paymentId}`);

    try {
      // OnePay doesn't have direct cancel API for pending payments
      // Usually handled by expiration or manual intervention

      return {
        externalPaymentId: paymentId,
        status: PaymentStatus.CANCELLED,
        message: 'Payment cancellation requested',
        rawResponse: {
          action: 'cancel_requested',
          paymentId,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(
        `OnePay payment cancellation failed: ${(error as Error).message}`,
      );
      throw new Error(
        `OnePay payment cancellation failed: ${(error as Error).message}`,
      );
    }
  }

  async handleWebhook(
    webhookData: Record<string, any>,
  ): Promise<PaymentCallbackDto> {
    this.logger.log(
      `Processing OnePay webhook for order: ${webhookData.vpc_MerchTxnRef}`,
    );

    try {
      // Verify webhook signature
      const secureSecret = this.configService.get('ONEPAY_SECURE_SECRET');
      const receivedHash = webhookData.vpc_SecureHash;

      // Remove hash from data before verification
      const dataToVerify = { ...webhookData };
      delete dataToVerify.vpc_SecureHash;

      const expectedHash = this.generateOnePayHash(dataToVerify, secureSecret);

      if (receivedHash !== expectedHash) {
        throw new Error('Invalid webhook signature');
      }

      // Parse OnePay webhook response
      const isSuccess = webhookData.vpc_TxnResponseCode === '0';
      const status = this.mapOnePayStatusToPaymentStatus(
        webhookData.vpc_TxnResponseCode,
      );

      return {
        paymentId: webhookData.vpc_MerchTxnRef,
        externalPaymentId: webhookData.vpc_MerchTxnRef,
        transactionId: webhookData.vpc_TransactionNo,
        status,
        amount: parseFloat(webhookData.vpc_Amount) / 100, // Convert back to VND
        currency: 'VND',
        message: isSuccess
          ? 'Payment successful'
          : this.getOnePayErrorMessage(webhookData.vpc_TxnResponseCode),
        errorCode: isSuccess ? null : webhookData.vpc_TxnResponseCode,
        errorMessage: isSuccess ? null : webhookData.vpc_Message,
        processedAt: new Date(), // OnePay doesn't provide timestamp in webhook
        rawData: webhookData,
      };
    } catch (error) {
      this.logger.error(
        `OnePay webhook processing failed: ${(error as Error).message}`,
      );
      throw new Error(
        `OnePay webhook processing failed: ${(error as Error).message}`,
      );
    }
  }

  private generateOnePayHash(
    params: Record<string, string>,
    secureSecret: string,
  ): string {
    // OnePay hash generation (similar to VNPAY but different algorithm)

    // Remove empty parameters and sort
    const sortedParams = Object.keys(params)
      .filter(
        (key) =>
          params[key] !== null &&
          params[key] !== undefined &&
          params[key] !== '',
      )
      .sort();

    // Build query string
    const queryString = sortedParams
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    // Generate SHA256 hash
    return crypto
      .createHash('sha256')
      .update(queryString + '&' + secureSecret)
      .digest('hex')
      .toUpperCase();
  }

  private generateOnePayQRData(createPaymentDto: CreatePaymentDto): string {
    // OnePay QR code format (custom format since OnePay doesn't have built-in QR)
    return JSON.stringify({
      gateway: 'OnePay',
      merchantId: this.configService.get('ONEPAY_MERCHANT_ID'),
      orderId: createPaymentDto.orderId,
      amount: createPaymentDto.amount,
      currency: 'VND',
      description: createPaymentDto.description,
    });
  }

  private mapOnePayStatusToPaymentStatus(responseCode: string): PaymentStatus {
    // OnePay response codes mapping
    switch (responseCode) {
      case '0':
        return PaymentStatus.SUCCESS;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
        return PaymentStatus.FAILED;
      case '99':
        return PaymentStatus.CANCELLED; // User cancelled
      default:
        return PaymentStatus.FAILED;
    }
  }

  private getOnePayErrorMessage(responseCode: string): string {
    const errorMessages: Record<string, string> = {
      '1': 'Transaction declined',
      '2': 'Transaction failed',
      '3': 'System error',
      '4': 'Invalid card',
      '5': 'Insufficient funds',
      '6': 'Card expired',
      '7': 'Invalid CVV',
      '8': 'Card blocked',
      '9': 'Invalid amount',
      '10': 'Transaction limit exceeded',
      '11': 'Invalid merchant',
      '12': 'Duplicate transaction',
      '13': 'Invalid transaction',
      '99': 'Transaction cancelled by user',
      F: 'Transaction not found',
      T: 'Transaction timeout',
    };

    return errorMessages[responseCode] || 'Unknown error occurred';
  }

  private getClientIP(): string {
    // In real implementation, extract client IP from request
    // For now, return a default IP
    return '127.0.0.1';
  }
}
