import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { OtpPurpose, OtpTargetType } from '../constants/enums';
import { RequestOtpInput } from '../constants/interfaces';
import { ConfigService } from '@nestjs/config';
import { ActorType } from '@app/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class OtpService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
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

  async sendPasswordToken(email: string, userType: ActorType, selector: string,
    token: string) {
    const ttlSeconds = this.configService.get("OTP_TTL_SECONDS") || 600000; // 10 minutes
    const key = `reset:email:${email}:${userType}:${selector}`;

    await this.cacheManager.set<string>(key, "true", ttlSeconds); // ttl is in miliseconds

    const check = await this.cacheManager.get<string>(key);
    if (!check) throw new Error("Failed to cache OTP");

    const frontEndUrl = this.configService.get("RESET_PWD_URL");
    console.log(`Sending url: ${frontEndUrl}/?token=${token} to email ${email} for password reset`);
    // TODO: Send Email here

    return { success: true };
  }

  async verifyPasswordToken(email: string, userType: ActorType, selector: string) {
    const checkToken = await this.cacheManager.get<string>(`reset:email:${email}:${userType}:${selector}`);
    if (checkToken !== "true") {
      throw new BadRequestException("Invalid token");
    }

    await this.cacheManager.del(`reset:email:${email}:${userType}:${selector}`)
    return true;
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
