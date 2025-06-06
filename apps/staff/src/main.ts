import { NestFactory } from '@nestjs/core';
import { StaffModule } from './staff.module';
import { Logger } from 'nestjs-pino';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { STAFF_CONSUMER_GROUP } from '@app/common';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(StaffModule);
  const configService = appContext.get(ConfigService);

  const kafkaBroker = configService.get<string>('KAFKA_BROKER');
  if (!kafkaBroker) {
    throw new Error('KAFKA_BROKER environment variable is not set');
  }

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    StaffModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: [kafkaBroker],
        },
        consumer: {
          groupId: STAFF_CONSUMER_GROUP,
        },
      },
    },
  );

  app.useLogger(app.get(Logger));
  await app.listen();
}
void bootstrap();
