// apps/chat/src/main.ts

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { ChatModule } from './chat.module';

async function bootstrap() {
  const app = await NestFactory.create(ChatModule);
  const configService = app.get(ConfigService);

  // Use the logger configured in LoggerModule
  app.useLogger(app.get(Logger));

  // Get the port number from configuration
  const port = configService.get<number>('CHAT_SERVICE_PORT');

  await app.listen(port);
  
  
  app.get(Logger).log(`Chat service is running on port ${port}`);
}
bootstrap();