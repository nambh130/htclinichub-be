import { NestFactory } from '@nestjs/core';
import { CommunicationModule } from './communication.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { COMMUNICATION_CONSUMER_GROUP } from '@app/common';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(CommunicationModule);

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
      consumer: { groupId: COMMUNICATION_CONSUMER_GROUP },
    },
  });

  // 3. Add your logger (optional)
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 4. Start both
  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3003);
}
bootstrap();
