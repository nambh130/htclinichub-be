import { NestFactory } from '@nestjs/core';
import { CommunicationModule } from './communication.module';
import { Logger } from 'nestjs-pino';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import {
  HttpServiceExceptionFilter,
  COMMUNICATION_CONSUMER_GROUP,
} from '@app/common';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(CommunicationModule); // HTTP + DI context
  const configService = app.get(ConfigService);
  const logger = app.get(Logger);

  // Kafka Configuration
  const kafkaBroker = configService.get<string>('KAFKA_BROKER');
  if (!kafkaBroker) {
    throw new Error('KAFKA_BROKER environment variable is not set');
  }

  app.useLogger(logger);

  // Connect Kafka microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [kafkaBroker],
      },
      consumer: {
        groupId: COMMUNICATION_CONSUMER_GROUP,
      },
    },
  });

  // Use HTTP exception filter for HTTP endpoints
  app.useGlobalFilters(new HttpServiceExceptionFilter());

  // Global pipes for validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = configService.get<number>('COMMUNICATION_SERVICE_PORT');

  // Start both HTTP and Kafka servers
  await app.startAllMicroservices();
  await app.listen(port);

  logger.log(
    `Communication service is running at http://communication:${port} with Kafka broker ${kafkaBroker}`,
  );
}

void bootstrap();
