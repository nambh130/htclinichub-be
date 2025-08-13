import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { INPUT_VITAL_SIGNS_CONSUMER_GROUP } from '@app/common';
import { AnalyzeHealthcareDataModule } from './analyze-healthcare-data.module';

async function bootstrap() {
  const app = await NestFactory.create(AnalyzeHealthcareDataModule); // HTTP + DI context
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
        groupId: INPUT_VITAL_SIGNS_CONSUMER_GROUP,
      },
    },
  });

  // Use Kafka exception filter for Kafka context only
  // app.useGlobalFilters(new KafkaExceptionFilter());

  const port = configService.get<number>('ANALYZE_HEALTHCARE_DATA_PORT');
  const host = configService.get<string>('ANALYZE_HEALTHCARE_DATA_HOST');

  // Start both HTTP and Kafka servers
  await app.startAllMicroservices();
  await app.listen(port, host);

  logger.log(
    `Analyze healthcare data service is running at http://${host}:${port} with Kafka broker ${kafkaBroker}`,
  );
}
void bootstrap();
