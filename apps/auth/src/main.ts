import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { Logger } from 'nestjs-pino';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AUTH_CONSUMER_GROUP } from '@app/common';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  // 1. Create the HTTP application
  const app = await NestFactory.create(AuthModule);
  const configService = app.get<ConfigService>(ConfigService);

  // 2. Configure Kafka as a "connected" microservice
  const kafkaBroker = configService.get<string>('KAFKA_BROKER');
  if (!kafkaBroker) {
    throw new Error('KAFKA_BROKER environment variable is not set');
  }
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: { brokers: [kafkaBroker] },
      consumer: { groupId: AUTH_CONSUMER_GROUP },
    },
  });

  // 3. Add your logger (optional)
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cookieParser());

  // 4. Start both
  await app.startAllMicroservices();
  await app.listen(3001);

  console.log('🔐 Auth HTTP server listening on http://localhost:3001');
  console.log('🎧 Kafka microservice connected to', kafkaBroker);
}

void bootstrap();
