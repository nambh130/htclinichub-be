import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { OtpPurpose, OtpTargetType } from '../constants/enums';
import { RequestOtpInput } from '../constants/interfaces';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtpService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService
  ) { }

  async sendOtp(input: RequestOtpInput) {
    const code = this.generateOtp();
    const ttlSeconds = this.configService.get("OTP_TTL_SECONDS") || 600000; // 10 minutes
    const key = `otp:${input.purpose}:${input.type}:${input.target}`;

    await this.cacheManager.set<string>(key, code, ttlSeconds); // ttl is in miliseconds

    const check = await this.cacheManager.get<string>(key);
    if (!check) throw new Error("Failed to cache OTP");

    // Send SMS or Email
    if (input.type === OtpTargetType.PHONE) {
      console.log(`Sending OTP ${code} to phone ${input.target} for ${input.purpose}`);
      // TODO: Send SMS here
    } else {
      console.log(`Sending OTP ${code} to email ${input.target} for ${input.purpose}`);
      // TODO: Send Email here
    }

    return { success: true };
  }

  async verifyOtp(
    target: string,
    type: OtpTargetType,
    purpose: OtpPurpose,
    submittedOtp: string
  ): Promise<boolean> {
    const key = `otp:${purpose}:${type}:${target}`;
    const cachedOtp = await this.cacheManager.get<string>(key);

    if (cachedOtp && cachedOtp === submittedOtp) {
      await this.cacheManager.del(key); // OTP is one-time
      return true;
    }

    return false;
  }

  private generateOtp(length = 6): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
  }
}
