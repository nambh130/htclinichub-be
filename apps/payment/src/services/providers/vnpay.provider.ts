import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as querystring from 'querystring';
import * as moment from 'moment';
import {
  PaymentProviderInterface,
  PaymentResponse,
  PaymentStatusResponse,
} from './payment-provider.interface';
import { CreatePaymentDto, PaymentCallbackDto } from '../../dto';
import { PaymentStatus } from '../../enums';

@Injectable()
export class VnpayProvider implements PaymentProviderInterface {
  private readonly logger = new Logger(VnpayProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async createPayment(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponse> {
    this.logger.log(
      `Creating VNPAY payment for amount: ${createPaymentDto.amount}`,
    );

    try {
      // VNPAY configuration
      const vnpTmnCode = this.configService.get('VNPAY_TMN_CODE');
      const vnpSecretKey = this.configService.get('VNPAY_SECRET_KEY');
      const vnpUrl =
        this.configService.get('VNPAY_API_URL') ||
        'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

      if (!vnpTmnCode || !vnpSecretKey) {
        throw new Error('VNPAY configuration missing');
      }

      // Build payment parameters
      const vnpParams: Record<string, string> = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: vnpTmnCode,
        vnp_Amount: (createPaymentDto.amount * 100).toString(), // Convert to VND cents
        vnp_CurrCode: 'VND',
        vnp_TxnRef: createPaymentDto.orderId,
        vnp_OrderInfo:
          createPaymentDto.description ||
          `Payment for order ${createPaymentDto.orderId}`,
        vnp_OrderType: 'other',
        vnp_Locale: 'vn',
        vnp_ReturnUrl:
          createPaymentDto.returnUrl ||
          `${this.configService.get('BASE_URL')}/payment/return`,
        vnp_IpAddr: '127.0.0.1', // In production, get real IP
        vnp_CreateDate: moment().format('YYYYMMDDHHmmss'),
      };

      // Add optional parameters
      if (createPaymentDto.patientId) {
        vnpParams.vnp_OrderInfo += ` - Patient: ${createPaymentDto.patientId}`;
      }
      if (createPaymentDto.clinicId) {
        vnpParams.vnp_OrderInfo += ` - Clinic: ${createPaymentDto.clinicId}`;
      }

      // Generate secure hash
      const secureHash = this.generateSecureHash(vnpParams, vnpSecretKey);
      vnpParams.vnp_SecureHash = secureHash;

      // Build payment URL
      const paymentUrl = `${vnpUrl}?${querystring.stringify(vnpParams)}`;
      const qrCodeUrl = `${paymentUrl}&vnp_OrderType=qr`;

      // Generate QR code data for VietQR standard
      const qrCodeData = this.generateVietQRData(createPaymentDto);

      this.logger.log(
        `VNPAY payment URL generated for order: ${createPaymentDto.orderId}`,
      );

      return {
        externalPaymentId: createPaymentDto.orderId,
        paymentUrl,
        qrCodeUrl,
        qrCodeData,
        status: PaymentStatus.PENDING,
        message: 'Payment URL generated successfully',
        rawResponse: vnpParams,
      };
    } catch (error) {
      this.logger.error(
        `VNPAY payment creation failed: ${(error as Error).message}`,
      );
      throw new Error(
        `VNPAY payment creation failed: ${(error as Error).message}`,
      );
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    this.logger.log(`Getting VNPAY payment status for: ${paymentId}`);

    try {
      // VNPAY Query API configuration
      const vnpTmnCode = this.configService.get('VNPAY_TMN_CODE');
      const vnpSecretKey = this.configService.get('VNPAY_SECRET_KEY');
      const vnpQueryUrl =
        this.configService.get('VNPAY_QUERY_URL') ||
        'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction';

      const queryParams = {
        vnp_Version: '2.1.0',
        vnp_Command: 'querydr',
        vnp_TmnCode: vnpTmnCode,
        vnp_TxnRef: paymentId,
        vnp_OrderInfo: `Query transaction ${paymentId}`,
        vnp_TransactionDate: moment().format('YYYYMMDDHHmmss'),
        vnp_CreateDate: moment().format('YYYYMMDDHHmmss'),
        vnp_IpAddr: '127.0.0.1',
      };

      const secureHash = this.generateSecureHash(queryParams, vnpSecretKey);
      queryParams.vnp_SecureHash = secureHash;

      // In a real implementation, you would make an HTTP request to VNPAY
      // For now, return a mock response
      // const response = await this.httpService.post(vnpQueryUrl, queryParams).toPromise();

      // Mock response for demonstration
      const mockResponse = {
        vnp_ResponseCode: '00', // 00 = success, others = various error codes
        vnp_TransactionStatus: '00', // 00 = success
        vnp_Amount: '50000000',
        vnp_TxnRef: paymentId,
      };

      const status = this.mapVnpayStatusToPaymentStatus(
        mockResponse.vnp_ResponseCode,
        mockResponse.vnp_TransactionStatus,
      );

      return {
        status,
        externalPaymentId: paymentId,
        amount: parseFloat(mockResponse.vnp_Amount) / 100,
        currency: 'VND',
        message:
          status === PaymentStatus.SUCCESS
            ? 'Payment successful'
            : 'Payment failed',
        rawResponse: mockResponse,
      };
    } catch (error) {
      this.logger.error(
        `VNPAY status check failed: ${(error as Error).message}`,
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
    this.logger.log(`Cancelling VNPAY payment: ${paymentId}`);

    try {
      // VNPAY doesn't have a direct cancel API for pending payments
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
        `VNPAY payment cancellation failed: ${(error as Error).message}`,
      );
      throw new Error(
        `VNPAY payment cancellation failed: ${(error as Error).message}`,
      );
    }
  }

  async handleWebhook(
    webhookData: Record<string, any>,
  ): Promise<PaymentCallbackDto> {
    this.logger.log(
      `Processing VNPAY webhook for order: ${webhookData.vnp_TxnRef}`,
    );

    try {
      // Verify webhook signature
      const vnpSecretKey = this.configService.get('VNPAY_SECRET_KEY');
      const receivedHash = webhookData.vnp_SecureHash;
      delete webhookData.vnp_SecureHash; // Remove hash before verification

      const expectedHash = this.generateSecureHash(webhookData, vnpSecretKey);

      if (receivedHash !== expectedHash) {
        throw new Error('Invalid webhook signature');
      }

      // Parse VNPAY response
      const isSuccess =
        webhookData.vnp_ResponseCode === '00' &&
        webhookData.vnp_TransactionStatus === '00';

      const status = this.mapVnpayStatusToPaymentStatus(
        webhookData.vnp_ResponseCode,
        webhookData.vnp_TransactionStatus,
      );

      return {
        paymentId: webhookData.vnp_TxnRef,
        externalPaymentId: webhookData.vnp_TxnRef,
        transactionId: webhookData.vnp_BankTranNo,
        status,
        amount: parseFloat(webhookData.vnp_Amount) / 100, // Convert back to VND
        currency: 'VND',
        message: isSuccess
          ? 'Payment successful'
          : this.getVnpayErrorMessage(webhookData.vnp_ResponseCode),
        errorCode: isSuccess ? null : webhookData.vnp_ResponseCode,
        errorMessage: isSuccess
          ? null
          : this.getVnpayErrorMessage(webhookData.vnp_ResponseCode),
        processedAt: this.parseVnpayDate(webhookData.vnp_PayDate),
        rawData: webhookData,
      };
    } catch (error) {
      this.logger.error(
        `VNPAY webhook processing failed: ${(error as Error).message}`,
      );
      throw new Error(
        `VNPAY webhook processing failed: ${(error as Error).message}`,
      );
    }
  }

  private generateSecureHash(
    params: Record<string, string>,
    secretKey: string,
  ): string {
    // Sort parameters alphabetically
    const sortedKeys = Object.keys(params).sort();
    const queryString = sortedKeys
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    // Generate HMAC SHA512 hash
    return crypto
      .createHmac('sha512', secretKey)
      .update(queryString)
      .digest('hex');
  }

  private generateVietQRData(createPaymentDto: CreatePaymentDto): string {
    // VietQR format for VNPAY
    // This would be the actual QR code content for banking apps
    return JSON.stringify({
      bankCode: 'VNPAY',
      accountNo: this.configService.get('VNPAY_TMN_CODE'),
      amount: createPaymentDto.amount,
      purpose:
        createPaymentDto.description || `Payment ${createPaymentDto.orderId}`,
      orderId: createPaymentDto.orderId,
    });
  }

  private mapVnpayStatusToPaymentStatus(
    responseCode: string,
    transactionStatus: string,
  ): PaymentStatus {
    // VNPAY response codes mapping
    if (responseCode === '00' && transactionStatus === '00') {
      return PaymentStatus.SUCCESS;
    }
    if (responseCode === '24') {
      return PaymentStatus.CANCELLED; // User cancelled
    }
    if (responseCode === '09') {
      return PaymentStatus.PENDING; // Transaction pending
    }
    return PaymentStatus.FAILED;
  }

  private getVnpayErrorMessage(responseCode: string): string {
    const errorMessages: Record<string, string> = {
      '01': 'Transaction is not completed',
      '02': 'Transaction failed',
      '04': 'Transaction reversed',
      '05': 'Payment processing',
      '06': 'Transaction successful but awaiting verification',
      '07': 'Debit successful but credit failed',
      '09': 'Transaction pending',
      '10': 'Transaction partially refunded',
      '11': 'Transaction awaiting payment confirmation',
      '12': 'Transaction cancelled',
      '13': 'Invalid amount',
      '24': 'Transaction cancelled by user',
      '51': 'Insufficient funds',
      '65': 'Transaction limit exceeded',
      '75': 'Bank is under maintenance',
      '79': 'Transaction limit exceeded',
      '99': 'Unknown error',
    };

    return errorMessages[responseCode] || 'Unknown error occurred';
  }

  private parseVnpayDate(vnpayDate: string): Date | null {
    try {
      // VNPAY date format: YYYYMMDDHHmmss
      return moment(vnpayDate, 'YYYYMMDDHHmmss').toDate();
    } catch {
      return null;
    }
  }
}
