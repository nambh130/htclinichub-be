import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { CacheModule } from '@nestjs/cache-manager';

// otp.module.ts
@Module({
  imports: [CacheModule.register()],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
