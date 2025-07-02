import { NestFactory } from '@nestjs/core';
import { ClinicsModule } from './clinics.module';
import { Logger } from 'nestjs-pino';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { CLINIC_CONSUMER_GROUP } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(ClinicsModule); // HTTP + DI context
  const configService = app.get(ConfigService);
  const logger = app.get(Logger);

  const kafkaBroker = configService.get<string>('KAFKA_BROKER');
  if (!kafkaBroker) {
    throw new Error('KAFKA_BROKER environment variable is not set');
  }

  app.useLogger(logger);

  // Kết nối Kafka microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [kafkaBroker],
      },
      consumer: {
        groupId: CLINIC_CONSUMER_GROUP,
      },
    },
  });

  const port = configService.get<number>('CLINIC_SERVICE_PORT') as number

  // Khởi động cả HTTP và Kafka
  await app.startAllMicroservices();
  await app.listen(port);

  logger.log(
    `Clinic service is running at http://clinic:${port} with Kafka broker ${kafkaBroker}`,
  );
}
void bootstrap();
