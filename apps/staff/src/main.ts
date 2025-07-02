import { NestFactory } from '@nestjs/core';
import { StaffModule } from './staff.module';
import { Logger } from 'nestjs-pino';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { HttpServiceExceptionFilter, STAFF_CONSUMER_GROUP } from '@app/common';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(StaffModule); // HTTP + DI context
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
        groupId: STAFF_CONSUMER_GROUP,
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

  const port = configService.get<number>('STAFF_SERVICE_PORT') as number;

  // Start both HTTP and Kafka servers
  await app.startAllMicroservices();
  await app.listen(port);

  logger.log(
    `Staff service is running at http://staff:${port} with Kafka broker ${kafkaBroker}`,
  );
}

void bootstrap();
