import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';

// otp.module.ts
@Module({
  imports: [CacheModule.register()],
  providers: [OtpService, JwtService],
  exports: [OtpService],
})
export class OtpModule {}
