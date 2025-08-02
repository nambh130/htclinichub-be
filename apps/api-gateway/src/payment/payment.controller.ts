import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  StorePayOSCredentialsDto,
  CreatePaymentLinkDto,
  GetPaymentsDto,
  GetTransactionsDto,
  GetPaymentStatisticsDto,
} from './payment.types';
import { WebhookType } from '@payos/node/lib/type';
import { CurrentUser, JwtAuthGuard, TokenPayload } from '@app/common';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // ========================================
  // 🔐 PAYOS CREDENTIAL MANAGEMENT (CRUD)
  // ========================================

  /**
   * Create - Store new PayOS credentials for a clinic
   */
  @Post('payos/credentials')
  @UseGuards(JwtAuthGuard)
  async storePayOSCredentials(
    @Body() dto: StorePayOSCredentialsDto,
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<{ message: string }> {
    await this.paymentService.storePayOSCredentials(dto, currentUser);
    return { message: 'PayOS credentials stored successfully' };
  }

  /**
   * Read - Get PayOS credentials status for a clinic
   */
  @Get('payos/credentials/:clinicId/status')
  @UseGuards(JwtAuthGuard)
  async getPayOSCredentialsStatus(
    @Param('clinicId') clinicId: string,
  ): Promise<unknown> {
    return this.paymentService.getPayOSCredentialsStatus(clinicId);
  }

  /**
   * Read - Get and decrypt PayOS credentials for a clinic
   */
  @Get('payos/credentials/:clinicId')
  @UseGuards(JwtAuthGuard)
  async getPayOSCredentials(
    @Param('clinicId') clinicId: string,
  ): Promise<unknown> {
    return this.paymentService.getPayOSCredentials(clinicId);
  }

  /**
   * Update - Update existing PayOS credentials
   */
  @Put('payos/credentials')
  @UseGuards(JwtAuthGuard)
  async updatePayOSCredentials(
    @Body() dto: StorePayOSCredentialsDto,
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<{ message: string }> {
    await this.paymentService.updatePayOSCredentials(dto, currentUser);
    return { message: 'PayOS credentials updated successfully' };
  }

  /**
   * Update - Activate PayOS credentials for a clinic
   */
  @Put('payos/credentials/:clinicId/activate')
  @UseGuards(JwtAuthGuard)
  async activatePayOSCredentials(
    @Param('clinicId') clinicId: string,
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<{ message: string }> {
    await this.paymentService.activatePayOSCredentials(clinicId, currentUser);
    return { message: 'PayOS credentials activated successfully' };
  }

  /**
   * Update - Deactivate PayOS credentials for a clinic
   */
  @Put('payos/credentials/:clinicId/deactivate')
  @UseGuards(JwtAuthGuard)
  async deactivatePayOSCredentials(
    @Param('clinicId') clinicId: string,
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<{ message: string }> {
    await this.paymentService.deactivatePayOSCredentials(clinicId, currentUser);
    return { message: 'PayOS credentials deactivated successfully' };
  }

  /**
   * Delete - Permanently delete PayOS credentials for a clinic
   */
  @Delete('payos/credentials/:clinicId')
  @UseGuards(JwtAuthGuard)
  async deletePayOSCredentials(
    @Param('clinicId') clinicId: string,
  ): Promise<unknown> {
    return this.paymentService.deletePayOSCredentials(clinicId);
  }

  /**
   * Test - Test PayOS credentials by creating and canceling a test payment
   */
  @Post('payos/credentials/test')
  @UseGuards(JwtAuthGuard)
  async testPayOSCredentials(
    @Body()
    credentials: {
      clientId: string;
      apiKey: string;
      checksumKey: string;
    },
  ): Promise<unknown> {
    return this.paymentService.testPayOSCredentials(
      credentials.clientId,
      credentials.apiKey,
      credentials.checksumKey,
    );
  }

  // ========================================
  // 💳 PAYMENT LINK MANAGEMENT
  // ========================================

  /**
   * Create - Create a new payment link using PayOS
   */
  @Post('payos/link')
  @UseGuards(JwtAuthGuard)
  async createPayOSPaymentLink(
    @Body() dto: CreatePaymentLinkDto,
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<unknown> {
    return this.paymentService.createPayOSPaymentLink(dto, currentUser);
  }

  // ========================================
  // 🔄 WEBHOOK PROCESSING
  // ========================================

  /**
   * Process - Handle incoming webhooks from PayOS
   */
  @Post('payos/webhook')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async processPayOSWebhook(
    @Body() webhookData: WebhookType,
  ): Promise<unknown> {
    return this.paymentService.processPayOSWebhook(webhookData);
  }

  // ========================================
  // 🏥 GENERAL PAYMENT MANAGEMENT
  // ========================================

  /**
   * Read - Get all payment configurations for a clinic (provider-agnostic)
   */
  @Get('clinic/:clinicId/configs')
  @UseGuards(JwtAuthGuard)
  async getAllPaymentConfigs(
    @Param('clinicId') clinicId: string,
  ): Promise<unknown> {
    return this.paymentService.getAllPaymentConfigs(clinicId);
  }

  /**
   * Read - Get all payments for a clinic with filtering and pagination
   */
  @Get('clinic/:clinicId')
  @UseGuards(JwtAuthGuard)
  async getPaymentsByClinic(
    @Param('clinicId') clinicId: string,
    @Query() query: GetPaymentsDto,
  ): Promise<unknown> {
    return this.paymentService.getPaymentsByClinic(clinicId, query);
  }

  /**
   * Read - Get all transactions for a clinic with filtering and pagination
   */
  @Get('clinic/:clinicId/transactions')
  @UseGuards(JwtAuthGuard)
  async getTransactionsByClinic(
    @Param('clinicId') clinicId: string,
    @Query() query: GetTransactionsDto,
  ): Promise<unknown> {
    return this.paymentService.getTransactionsByClinic(clinicId, query);
  }

  /**
   * Read - Get payment statistics and analytics for a clinic
   */
  @Get('clinic/:clinicId/statistics')
  @UseGuards(JwtAuthGuard)
  async getPaymentStatistics(
    @Param('clinicId') clinicId: string,
    @Query() query: GetPaymentStatisticsDto,
  ): Promise<unknown> {
    return this.paymentService.getPaymentStatistics(clinicId, query);
  }
}
