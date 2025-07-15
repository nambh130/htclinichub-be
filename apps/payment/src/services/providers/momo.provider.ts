import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
  PaymentProviderInterface,
  PaymentResponse,
  PaymentStatusResponse,
} from './payment-provider.interface';
import { CreatePaymentDto, PaymentCallbackDto } from '../../dto';
import { PaymentStatus } from '../../enums';

@Injectable()
export class MomoProvider implements PaymentProviderInterface {
  private readonly logger = new Logger(MomoProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async createPayment(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponse> {
    this.logger.log(
      `Creating MoMo payment for amount: ${createPaymentDto.amount}`,
    );

    try {
      // MoMo configuration
      const partnerCode = this.configService.get('MOMO_PARTNER_CODE');
      const accessKey = this.configService.get('MOMO_ACCESS_KEY');
      const secretKey = this.configService.get('MOMO_SECRET_KEY');
      const apiUrl =
        this.configService.get('MOMO_API_URL') ||
        'https://test-payment.momo.vn/v2/gateway/api/create';

      if (!partnerCode || !accessKey || !secretKey) {
        throw new Error('MoMo configuration missing');
      }

      // Build payment request
      const requestId = `${createPaymentDto.orderId}-${Date.now()}`;
      const redirectUrl =
        createPaymentDto.returnUrl ||
        `${this.configService.get('BASE_URL')}/payment/return`;
      const ipnUrl =
        createPaymentDto.notifyUrl ||
        `${this.configService.get('BASE_URL')}/webhooks/momo`;

      const momoParams = {
        partnerCode,
        partnerName: 'HTClinicHub',
        storeId: this.configService.get('MOMO_STORE_ID') || 'ClinicStore',
        requestId,
        amount: createPaymentDto.amount.toString(),
        orderId: createPaymentDto.orderId,
        orderInfo:
          createPaymentDto.description ||
          `Payment for order ${createPaymentDto.orderId}`,
        redirectUrl,
        ipnUrl,
        lang: 'vi',
        requestType: 'payWithATM', // Options: payWithATM, payWithCC, captureWallet
        extraData: this.buildExtraData(createPaymentDto),
      };

      // Generate signature
      const signature = this.generateMomoSignature(
        momoParams,
        accessKey,
        secretKey,
      );

      const requestData = {
        ...momoParams,
        signature,
      };

      // In real implementation, make HTTP request to MoMo API
      // const response = await this.httpService.post(apiUrl, requestData).toPromise();

      // Mock successful response for demonstration
      const mockResponse = {
        partnerCode,
        orderId: createPaymentDto.orderId,
        requestId,
        amount: createPaymentDto.amount,
        responseTime: Date.now(),
        message: 'Successful.',
        resultCode: 0, // 0 = success
        payUrl: `https://test-payment.momo.vn/gw_payment/payment/qr?partnerCode=${partnerCode}&accessKey=${accessKey}&requestId=${requestId}&amount=${createPaymentDto.amount}&orderId=${createPaymentDto.orderId}&orderInfo=${encodeURIComponent(momoParams.orderInfo)}&returnUrl=${encodeURIComponent(redirectUrl)}&notifyUrl=${encodeURIComponent(ipnUrl)}&extraData=${momoParams.extraData}`,
        shortLink: `https://momo.page/${requestId}`,
        deeplink: `momo://app?action=payWithAppInApp&amount=${createPaymentDto.amount}&description=${encodeURIComponent(momoParams.orderInfo)}&partnerCode=${partnerCode}&partnerRefId=${createPaymentDto.orderId}`,
        qrCodeUrl: `https://test-payment.momo.vn/gw_payment/payment/qr?t=${requestId}`,
      };

      // Generate QR code data for MoMo
      const qrCodeData = this.generateMomoQRData(createPaymentDto, requestId);

      this.logger.log(
        `MoMo payment URL generated for order: ${createPaymentDto.orderId}`,
      );

      return {
        externalPaymentId: requestId,
        paymentUrl: mockResponse.payUrl,
        qrCodeUrl: mockResponse.qrCodeUrl,
        qrCodeData,
        status: PaymentStatus.PENDING,
        message: 'Payment URL generated successfully',
        rawResponse: mockResponse,
      };
    } catch (error) {
      this.logger.error(
        `MoMo payment creation failed: ${(error as Error).message}`,
      );
      throw new Error(
        `MoMo payment creation failed: ${(error as Error).message}`,
      );
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    this.logger.log(`Getting MoMo payment status for: ${paymentId}`);

    try {
      // MoMo Query Transaction API
      const partnerCode = this.configService.get('MOMO_PARTNER_CODE');
      const accessKey = this.configService.get('MOMO_ACCESS_KEY');
      const secretKey = this.configService.get('MOMO_SECRET_KEY');
      const queryUrl =
        this.configService.get('MOMO_QUERY_URL') ||
        'https://test-payment.momo.vn/v2/gateway/api/query';

      const queryParams = {
        partnerCode,
        requestId: paymentId,
        orderId: paymentId.split('-')[0], // Extract original order ID
        lang: 'vi',
      };

      const signature = this.generateMomoQuerySignature(
        queryParams,
        accessKey,
        secretKey,
      );

      const requestData = {
        ...queryParams,
        signature,
      };

      // In real implementation, make HTTP request to MoMo
      // const response = await this.httpService.post(queryUrl, requestData).toPromise();

      // Mock response for demonstration
      const mockResponse = {
        partnerCode,
        orderId: queryParams.orderId,
        requestId: paymentId,
        amount: 500000,
        responseTime: Date.now(),
        message: 'Successful.',
        resultCode: 0, // 0 = success, others = error
        payType: 'qr',
        transId: 2394804685, // MoMo transaction ID
      };

      const status = this.mapMomoStatusToPaymentStatus(mockResponse.resultCode);

      return {
        status,
        externalPaymentId: paymentId,
        amount: mockResponse.amount,
        currency: 'VND',
        message:
          status === PaymentStatus.SUCCESS
            ? 'Payment successful'
            : 'Payment failed',
        rawResponse: mockResponse,
      };
    } catch (error) {
      this.logger.error(
        `MoMo status check failed: ${(error as Error).message}`,
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
    this.logger.log(`Cancelling MoMo payment: ${paymentId}`);

    try {
      // MoMo doesn't have direct cancel API for pending payments
      // Typically handled through expiration or customer service

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
        `MoMo payment cancellation failed: ${(error as Error).message}`,
      );
      throw new Error(
        `MoMo payment cancellation failed: ${(error as Error).message}`,
      );
    }
  }

  async handleWebhook(
    webhookData: Record<string, any>,
  ): Promise<PaymentCallbackDto> {
    this.logger.log(
      `Processing MoMo webhook for order: ${webhookData.orderId}`,
    );

    try {
      // Verify webhook signature
      const accessKey = this.configService.get('MOMO_ACCESS_KEY');
      const secretKey = this.configService.get('MOMO_SECRET_KEY');

      const receivedSignature = webhookData.signature;
      const expectedSignature = this.generateMomoWebhookSignature(
        webhookData,
        accessKey,
        secretKey,
      );

      if (receivedSignature !== expectedSignature) {
        throw new Error('Invalid webhook signature');
      }

      // Parse MoMo webhook response
      const isSuccess = webhookData.resultCode === 0;
      const status = this.mapMomoStatusToPaymentStatus(webhookData.resultCode);

      return {
        paymentId: webhookData.orderId,
        externalPaymentId: webhookData.requestId,
        transactionId: webhookData.transId?.toString(),
        status,
        amount: webhookData.amount,
        currency: 'VND',
        message: isSuccess
          ? 'Payment successful'
          : this.getMomoErrorMessage(webhookData.resultCode),
        errorCode: isSuccess ? null : webhookData.resultCode?.toString(),
        errorMessage: isSuccess ? null : webhookData.message,
        processedAt: new Date(webhookData.responseTime),
        rawData: webhookData,
      };
    } catch (error) {
      this.logger.error(
        `MoMo webhook processing failed: ${(error as Error).message}`,
      );
      throw new Error(
        `MoMo webhook processing failed: ${(error as Error).message}`,
      );
    }
  }

  private generateMomoSignature(
    params: any,
    accessKey: string,
    secretKey: string,
  ): string {
    // MoMo signature format
    const rawSignature = `accessKey=${accessKey}&amount=${params.amount}&extraData=${params.extraData}&ipnUrl=${params.ipnUrl}&orderId=${params.orderId}&orderInfo=${params.orderInfo}&partnerCode=${params.partnerCode}&redirectUrl=${params.redirectUrl}&requestId=${params.requestId}&requestType=${params.requestType}`;

    return crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');
  }

  private generateMomoQuerySignature(
    params: any,
    accessKey: string,
    secretKey: string,
  ): string {
    // MoMo query signature format
    const rawSignature = `accessKey=${accessKey}&orderId=${params.orderId}&partnerCode=${params.partnerCode}&requestId=${params.requestId}`;

    return crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');
  }

  private generateMomoWebhookSignature(
    webhookData: any,
    accessKey: string,
    secretKey: string,
  ): string {
    // MoMo webhook signature verification
    const rawSignature = `accessKey=${accessKey}&amount=${webhookData.amount}&extraData=${webhookData.extraData}&message=${webhookData.message}&orderId=${webhookData.orderId}&orderInfo=${webhookData.orderInfo}&orderType=${webhookData.orderType}&partnerCode=${webhookData.partnerCode}&payType=${webhookData.payType}&requestId=${webhookData.requestId}&responseTime=${webhookData.responseTime}&resultCode=${webhookData.resultCode}&transId=${webhookData.transId}`;

    return crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');
  }

  private buildExtraData(createPaymentDto: CreatePaymentDto): string {
    // Build extra data for MoMo (base64 encoded JSON)
    const extraInfo = {
      patientId: createPaymentDto.patientId,
      clinicId: createPaymentDto.clinicId,
      appointmentId: createPaymentDto.appointmentId,
      metadata: createPaymentDto.metadata,
    };

    return Buffer.from(JSON.stringify(extraInfo)).toString('base64');
  }

  private generateMomoQRData(
    createPaymentDto: CreatePaymentDto,
    requestId: string,
  ): string {
    // MoMo QR code format
    return JSON.stringify({
      partnerCode: this.configService.get('MOMO_PARTNER_CODE'),
      requestId,
      orderId: createPaymentDto.orderId,
      amount: createPaymentDto.amount,
      orderInfo: createPaymentDto.description,
      payType: 'qr',
    });
  }

  private mapMomoStatusToPaymentStatus(resultCode: number): PaymentStatus {
    // MoMo result codes mapping
    switch (resultCode) {
      case 0:
        return PaymentStatus.SUCCESS;
      case 1006:
        return PaymentStatus.CANCELLED; // User cancelled
      case 1001:
      case 1002:
      case 1003:
        return PaymentStatus.PENDING; // Processing
      default:
        return PaymentStatus.FAILED;
    }
  }

  private getMomoErrorMessage(resultCode: number): string {
    const errorMessages: Record<number, string> = {
      1: 'Transaction failed',
      2: 'Invalid parameters',
      3: 'Data not found',
      4: 'Request timeout',
      5: 'Duplicate request',
      6: 'System maintenance',
      7: 'Invalid signature',
      8: 'Invalid partner',
      9: 'Invalid access key',
      10: 'Invalid request type',
      11: 'Invalid amount',
      12: 'Invalid order info',
      1001: 'Transaction is being processed',
      1002: 'Transaction is pending',
      1003: 'Transaction awaiting OTP confirmation',
      1004: 'Transaction denied by issuer',
      1005: 'Transaction failed due to insufficient funds',
      1006: 'Transaction cancelled by user',
      1007: 'Transaction rejected by user',
      2001: 'Order not found',
      2007: 'Invalid amount range',
      4001: 'Invalid bank account',
      4100: 'Transaction limit exceeded',
      9000: 'System error',
    };

    return errorMessages[resultCode] || 'Unknown error occurred';
  }
}
