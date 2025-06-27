import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { ConfigModule } from '@nestjs/config';
import { httpClientConfig, HttpModules } from '../api/http.client';
import { AuthModule } from '../auth/auth.module';
import { MEDIA_SERVICE } from '@app/common';

@Module({
  imports: [
    ConfigModule,
    HttpModules.registerAsync([
      httpClientConfig(
        MEDIA_SERVICE,
        'MEDIA_SERVICE_HOST',
        'MEDIA_SERVICE_PORT',
      ),
    ]),

    AuthModule,
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
