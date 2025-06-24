import { NestFactory } from '@nestjs/core';
import { ClinicsModule } from './clinics.module';
import { Logger } from 'nestjs-pino';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { CLINIC_CONSUMER_GROUP } from '@app/common';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(ClinicsModule);
  const configService = appContext.get(ConfigService);

  const kafkaBroker = configService.get<string>('KAFKA_BROKER');
  if (!kafkaBroker) {
    throw new Error('KAFKA_BROKER environment variable is not set');
  }

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ClinicsModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [kafkaBroker],
        },
        consumer: {
          groupId: CLINIC_CONSUMER_GROUP,
        },
      },
    },
  );

  app.useLogger(app.get(Logger));
  await app.listen();
}
void bootstrap();
