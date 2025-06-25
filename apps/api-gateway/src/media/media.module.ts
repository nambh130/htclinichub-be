import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { httpClientConfig } from '../api/http.client';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        httpClientConfig(
          configService.get<string>('MEDIA_SERVICE_HOST'),
          configService.get<string>('MEDIA_SERVICE_PORT'),
        ),
      inject: [ConfigService],
    }),

    AuthModule,
  ],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
