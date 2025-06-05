import { NestFactory } from '@nestjs/core';
import { PatientsModule } from './patients.module';
import { Logger } from 'nestjs-pino';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { PATIENT_CONSUMER_GROUP } from '@app/common';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(PatientsModule);
  const configService = appContext.get(ConfigService);

  const kafkaBroker = configService.get<string>('KAFKA_BROKER');
  if (!kafkaBroker) {
    throw new Error('KAFKA_BROKER environment variable is not set');
  }

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PatientsModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [kafkaBroker],
        },
        consumer: {
          groupId: PATIENT_CONSUMER_GROUP,
        },
      },
    },
  );

  app.useLogger(app.get(Logger));
  await app.listen();
}
void bootstrap();
