import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Interface for eSMS request
interface ESMSRequest {
  ApiKey: string;
  Content: string;
  Phone: string;
  SecretKey: string;
  Brandname: string;
  SmsType: string;
  IsUnicode: string;
  Sandbox?: string;
  RequestId: string;
  SendDate?: string;
  campaignid?: string;
  CallbackUrl?: string;
}

// Interface for eSMS response
interface ESMSResponse {
  CodeResult: string;
  CountRegenerate?: number;
  SMSID?: string;
  ErrorMessage?: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly eSMSUrl =
    'https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/';

  constructor(private readonly configService: ConfigService) {}

  /**
   * Send verification code via SMS using eSMS service
   * @param phoneNumber Vietnamese phone number (with or without country code)
   * @param code Verification code (max 8 characters)
   * @returns Promise with SMS sending result
   */
  async sendVerificationCode(
    phoneNumber: string,
    code: string,
  ): Promise<{ success: boolean; smsId?: string; message: string }> {
    try {
      // Validate and format phone number
      const formattedPhone = this.formatVietnamesePhoneNumber(phoneNumber);

      // Validate verification code
      this.validateVerificationCode(code);

      // Prepare SMS content
      const content = `${code} la ma xac minh dang ky Baotrixemay cua ban`;

      // Prepare request payload
      const smsRequest: ESMSRequest = {
        ApiKey: this.configService.get<string>('ESMS_API_KEY'),
        Content: content,
        Phone: formattedPhone,
        SecretKey: this.configService.get<string>('ESMS_SECRET_KEY'),
        Brandname: this.configService.get<string>('ESMS_BRANDNAME'),
        SmsType: '2', // CSKH type
        IsUnicode: '0', // No unicode
        Sandbox: this.configService.get<boolean>('ESMS_SANDBOX', false)
          ? '1'
          : '0',
        RequestId: uuidv4(),
        campaignid: 'Verification Code',
        CallbackUrl: this.configService.get<string>('ESMS_CALLBACK_URL'),
      };

      this.logger.log(`Sending SMS to ${formattedPhone} with code: ${code}`);

      // Send SMS request
      const response: AxiosResponse<ESMSResponse> = await axios.post(
        this.eSMSUrl,
        smsRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        },
      );

      // Handle response
      if (response.data.CodeResult === '100') {
        this.logger.log(
          `SMS sent successfully. SMS ID: ${response.data.SMSID}`,
        );
        return {
          success: true,
          smsId: response.data.SMSID,
          message: 'Verification code sent successfully',
        };
      } else {
        this.logger.error(
          `SMS sending failed. Code: ${response.data.CodeResult}, Error: ${response.data.ErrorMessage}`,
        );
        return {
          success: false,
          message: response.data.ErrorMessage || 'SMS sending failed',
        };
      }
    } catch (error) {
      this.logger.error(`Error sending SMS: ${error}`);

      if (axios.isAxiosError(error)) {
        throw new HttpException(
          `SMS service error: ${error.response?.data || error.message}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      throw new HttpException(
        'Internal server error while sending SMS',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Format Vietnamese phone number to standard format
   * @param phoneNumber Input phone number
   * @returns Formatted phone number
   */
  private formatVietnamesePhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Handle different formats
    if (cleaned.startsWith('84')) {
      // Already has country code
      return cleaned;
    } else if (cleaned.startsWith('0')) {
      // Remove leading 0 and add country code
      return '84' + cleaned.substring(1);
    } else if (cleaned.length === 9) {
      // 9-digit number without leading 0
      return '84' + cleaned;
    }

    // Validate Vietnamese mobile number patterns
    const vietnamesePattern =
      /^84(3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])[0-9]{7}$/;
    if (!vietnamesePattern.test(cleaned)) {
      throw new HttpException(
        'Invalid Vietnamese phone number format',
        HttpStatus.BAD_REQUEST,
      );
    }

    return cleaned;
  }

  /**
   * Validate verification code format
   * @param code Verification code to validate
   */
  private validateVerificationCode(code: string): void {
    if (!code || code.length === 0) {
      throw new HttpException(
        'Verification code is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (code.length > 8) {
      throw new HttpException(
        'Verification code must be 8 characters or less',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if code contains only alphanumeric characters
    const alphanumericPattern = /^[A-Za-z0-9]+$/;
    if (!alphanumericPattern.test(code)) {
      throw new HttpException(
        'Verification code must contain only letters and numbers',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
