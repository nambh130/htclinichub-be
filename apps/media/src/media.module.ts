import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { LoggerModule, MongoDatabaseModule } from '@app/common';
import { CloudinaryProvider } from './cloudinary/cloudinary.provider';
import { MediaDocument, MediaSchema } from './models/media.schema';
import { MediaRepository } from './repository/media.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        STAFF_SERVICE_PORT: Joi.number().required(),
        KAFKA_BROKER: Joi.required(),

        MEDIA_SERVICE_URI: Joi.string().required(),

        CLD_NAME: Joi.string().required(),
        CLD_API_KEY: Joi.string().required(),
        CLD_API_SECRET: Joi.string().required(),
      }),
    }),

    LoggerModule,
    MongoDatabaseModule.forRoot({
      envKey: 'MEDIA_SERVICE_URI',
      connectionName: 'mediaService',
    }),
    MongoDatabaseModule.forFeature(
      [{ name: MediaDocument.name, schema: MediaSchema }],
      'mediaService',
    ),
  ],
  controllers: [MediaController],
  providers: [MediaService, MediaRepository, CloudinaryProvider],
})
export class MediaModule {}
