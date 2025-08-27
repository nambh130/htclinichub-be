import {
  Controller,
  Post,
  Body,
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
  CreateCashPaymentDto,
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
   * Remove - Remove entire PayOS payment configuration for a clinic
   * This includes deleting credentials, canceling active payments, and cleanup
   */
  @Delete('payos/configuration/:clinicId')
  @UseGuards(JwtAuthGuard)
  async removePayOSConfiguration(
    @Param('clinicId') clinicId: string,
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<unknown> {
    return await this.paymentService.removePayOSConfiguration(
      clinicId,
      currentUser,
    );
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

  /**
   * Cancel - Cancel a PayOS payment link
   */
  @Put('payos/link/:paymentId/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelPayOSPayment(
    @Param('paymentId') paymentId: string,
    @Body() payload: { reason: string },
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<{ message: string }> {
    await this.paymentService.cancelPayOSPayment(
      paymentId,
      payload.reason,
      currentUser,
    );
    return { message: 'PayOS payment cancelled successfully' };
  }

  /**
   * Create - Create a new cash payment record
   */
  @Post('cash')
  @UseGuards(JwtAuthGuard)
  async createCashPayment(
    @Body() dto: CreateCashPaymentDto,
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<unknown> {
    return this.paymentService.createCashPayment(dto, currentUser);
  }

  /**
   * Update - Mark cash payment as paid
   */
  @Put('cash/:paymentId/paid')
  @UseGuards(JwtAuthGuard)
  async markCashPaymentAsPaid(
    @Param('paymentId') paymentId: string,
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<unknown> {
    return await this.paymentService.markCashPaymentAsPaid(
      paymentId,
      currentUser,
    );
  }

  /**
   * Update - Cancel cash payment and mark as failed
   */
  @Put('cash/:paymentId/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelCashPayment(
    @Param('paymentId') paymentId: string,
    @Body() payload: { reason: string },
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<unknown> {
    return await this.paymentService.cancelCashPayment(
      paymentId,
      payload.reason,
      currentUser,
    );
  }

  // ========================================
  // 🔄 WEBHOOK PROCESSING
  // ========================================

  /**
   * Configure - Register webhook URL with PayOS for a clinic
   */
  @Post('payos/webhook/configure')
  @UseGuards(JwtAuthGuard)
  async configurePayOSWebhook(
    @Body() dto: { clinicId: string; webhookUrl: string },
  ): Promise<{ message: string; result: unknown }> {
    const result = await this.paymentService.configurePayOSWebhook(
      dto.clinicId,
      dto.webhookUrl,
    );
    return {
      message: 'Webhook URL configured successfully',
      result,
    };
  }

  /**
   * Process - Handle incoming webhooks from PayOS
   * Note: No authentication guard because PayOS webhooks don't include JWT tokens
   * Security is handled via signature verification in the service layer
   */
  @Post('payos/webhook-url')
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
  // @UseGuards(JwtAuthGuard)
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
   * Read - Get a specific payment by ID for a clinic
   */
  @Get('clinic/:clinicId/payment/:paymentId')
  @UseGuards(JwtAuthGuard)
  async getPaymentById(
    @Param('clinicId') clinicId: string,
    @Param('paymentId') paymentId: string,
  ): Promise<unknown> {
    return this.paymentService.getPaymentById(clinicId, paymentId);
  }

  /**
   * Read - Get payment by appointment ID for a specific clinic
   */
  @Get('clinic/:clinicId/appointment/:appointmentId')
  @UseGuards(JwtAuthGuard)
  async getPaymentByAppointmentId(
    @Param('clinicId') clinicId: string,
    @Param('appointmentId') appointmentId: string,
  ): Promise<unknown> {
    return this.paymentService.getPaymentByAppointmentId(
      clinicId,
      appointmentId,
    );
  }

  /**
   * Read - Get ALL payments for a specific clinic and appointment
   */
  @Get('clinic/:clinicId/appointment/:appointmentId/all')
  @UseGuards(JwtAuthGuard)
  async getAllPaymentsByAppointmentId(
    @Param('clinicId') clinicId: string,
    @Param('appointmentId') appointmentId: string,
  ): Promise<unknown> {
    return this.paymentService.getAllPaymentsByAppointmentId(
      clinicId,
      appointmentId,
    );
  }

  /**
   * Read - Get all PAID payments for a specific clinic and appointment
   */
  @Get('clinic/:clinicId/appointment/:appointmentId/paid')
  @UseGuards(JwtAuthGuard)
  async getPaidPaymentsByAppointmentId(
    @Param('clinicId') clinicId: string,
    @Param('appointmentId') appointmentId: string,
  ): Promise<unknown> {
    return this.paymentService.getPaidPaymentsByAppointmentId(
      clinicId,
      appointmentId,
    );
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

  /**
   * Read - Get comprehensive payment analytics for a clinic
   */
  @Get('clinic/:clinicId/analytics')
  @UseGuards(JwtAuthGuard)
  async getPaymentAnalytics(
    @Param('clinicId') clinicId: string,
    @Query()
    query: {
      period: string;
      customStartDate?: string;
      customEndDate?: string;
    },
  ): Promise<unknown> {
    return this.paymentService.getPaymentAnalytics(
      clinicId,
      query.period,
      query.customStartDate,
      query.customEndDate,
    );
  }
}
