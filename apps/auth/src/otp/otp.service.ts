import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class OtpService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

  async sendOtp(dto: RequestOtpDto) {
    const code = this.generateOtp();
    const ttlSeconds = 1000 * 60 * 10; // 10 minutes

    // Store OTP in cache: key is phone number, value is code
    await this.cacheManager.set(dto.phone, code, ttlSeconds);
    const check = await this.cacheManager.get(dto.phone);
    if(!check){
      throw new Error("Cache error;");
    }

    // Here, integrate SMS sending logic, e.g., Twilio
    console.log(`Sending OTP ${code} to ${dto.phone}`);

    return { success: true };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<boolean> {
    const { phone, otp } = verifyOtpDto;
    const cachedCode = await this.cacheManager.get<string>(phone);

    if (cachedCode && cachedCode === otp) {
      // Optionally delete OTP after verification
      await this.cacheManager.del(phone);
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
