import { Module } from '@nestjs/common';
import { LoggerModule, PostgresDatabaseModule } from '@app/common';
import { RefreshToken } from './models/refresh-token.model';
import { RefreshTokenRepository } from './refresh-token.repository';

@Module({
  imports: [
    PostgresDatabaseModule,
    PostgresDatabaseModule.forFeature([RefreshToken]),
    LoggerModule,
  ],
  providers: [RefreshTokenRepository],
  exports: [RefreshTokenRepository],
})
export class RefreshTokenModule {}
