import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Logger,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  CreatePaymentDto,
  PaymentStatusDto,
  PaymentListDto,
  GenerateQRCodeDto,
  QRCodeResponseDto,
} from './dto';

@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  getHello(): string {
    return this.paymentService.getHello();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentStatusDto> {
    this.logger.log(
      `Creating payment for provider: ${createPaymentDto.provider}`,
    );
    return await this.paymentService.createPayment(createPaymentDto);
  }

  @Get('list')
  async getPayments(@Query() query: PaymentListDto): Promise<{
    payments: PaymentStatusDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    this.logger.log('Getting payments list');
    const result = await this.paymentService.getPayments(query);

    return {
      ...result,
      page: query.page || 1,
      limit: query.limit || 20,
    };
  }

  @Get(':id')
  async getPaymentStatus(
    @Param('id') paymentId: string,
  ): Promise<PaymentStatusDto> {
    this.logger.log(`Getting payment status for: ${paymentId}`);
    return await this.paymentService.getPaymentStatus(paymentId);
  }

  @Put(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelPayment(
    @Param('id') paymentId: string,
  ): Promise<PaymentStatusDto> {
    this.logger.log(`Cancelling payment: ${paymentId}`);
    return await this.paymentService.cancelPayment(paymentId);
  }

  @Post('qr-code')
  @HttpCode(HttpStatus.CREATED)
  async generateQRCode(
    @Body() generateQRDto: GenerateQRCodeDto,
  ): Promise<QRCodeResponseDto> {
    this.logger.log(
      `Generating QR code for payment: ${generateQRDto.paymentId}`,
    );
    return await this.paymentService.generateQRCode(generateQRDto);
  }

  @Get('methods/available')
  getAvailablePaymentMethods(): {
    methods: Array<{
      id: string;
      name: string;
      provider: string;
      displayName: string;
      iconUrl?: string;
      isActive: boolean;
      minAmount: number;
      maxAmount?: number;
      supportedCurrencies: string[];
    }>;
  } {
    this.logger.log('Getting available payment methods');
    // TODO: Implement getting available payment methods from database
    return {
      methods: [
        {
          id: 'vnpay-bank-transfer',
          name: 'bank_transfer',
          provider: 'VNPAY',
          displayName: 'Chuyển khoản ngân hàng',
          isActive: true,
          minAmount: 10000,
          maxAmount: 500000000,
          supportedCurrencies: ['VND'],
        },
        {
          id: 'momo-wallet',
          name: 'momo',
          provider: 'MOMO',
          displayName: 'Ví MoMo',
          isActive: true,
          minAmount: 10000,
          maxAmount: 50000000,
          supportedCurrencies: ['VND'],
        },
      ],
    };
  }

  @Get('analytics/summary')
  getPaymentSummary(@Query() _query: Record<string, unknown>): {
    totalAmount: number;
    totalCount: number;
    successRate: number;
    summary: {
      success: number;
      failed: number;
      pending: number;
      cancelled: number;
    };
  } {
    this.logger.log('Getting payment summary');
    // TODO: Implement payment analytics using repository
    return {
      totalAmount: 0,
      totalCount: 0,
      successRate: 0,
      summary: {
        success: 0,
        failed: 0,
        pending: 0,
        cancelled: 0,
      },
    };
  }
}
