import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { CLOUDINARY } from '@app/common';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: (configService: ConfigService) => {
    cloudinary.config({
      cloud_name: configService.getOrThrow<string>('CLD_NAME'),
      api_key: configService.getOrThrow<string>('CLD_API_KEY'),
      api_secret: configService.getOrThrow<string>('CLD_API_SECRET'),
    });

    return cloudinary;
  },
  inject: [ConfigService],
};
