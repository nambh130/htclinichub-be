import { NestFactory } from '@nestjs/core';
import { PatientsModule } from './patients.module';
import { Logger } from 'nestjs-pino';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { PATIENT_CONSUMER_GROUP } from '@app/common';

async function bootstrap() {
   const app = await NestFactory.create(PatientsModule); // HTTP + DI context
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
          groupId: PATIENT_CONSUMER_GROUP,
        },
      },
    });
  
    // Use Kafka exception filter for Kafka context only
    // app.useGlobalFilters(new KafkaExceptionFilter());
  
    const port = configService.get<number>('PATIENT_SERVICE_PORT') as number;
  
    // Start both HTTP and Kafka servers
    await app.startAllMicroservices();
    await app.listen(port);
  
    logger.log(
      `Patient service is running at http://patient:${port} with Kafka broker ${kafkaBroker}`,
    );
  }
  void bootstrap();
  