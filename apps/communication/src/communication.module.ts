import { Module } from '@nestjs/common';
import { CommunicationController } from './communication.controller';
import { EmailService } from './services/email/email.service';
import { SmsService } from './services/sms/sms.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  COMMUNICATION_CONSUMER_GROUP,
  COMMUNICATION_SERVICE,
  LoggerModule,
} from '@app/common';
import Joi from 'joi';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        // Email configuration
        EMAIL_PASSWORD: Joi.string().required(),
        EMAIL_HOST: Joi.string().required(),
        EMAIL_PORT: Joi.string().required(),
        EMAIL_USERNAME: Joi.string().required(),
        EMAIL_SECURE: Joi.boolean().default(false),
        EMAIL_FROM: Joi.string().required(),

        // eSMS configuration
        ESMS_API_KEY: Joi.string().required(),
        ESMS_SECRET_KEY: Joi.string().required(),
        ESMS_BRANDNAME: Joi.string().required(),
        // ESMS_CALLBACK_URL: Joi.string().optional(),
        // ESMS_SANDBOX: Joi.boolean().default(false),

        // Kafka configuration
        KAFKA_BROKER: Joi.string().required(),
      }),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('EMAIL_HOST'),
          port: config.get<number>('EMAIL_PORT'),
          secure: config.get<boolean>('EMAIL_SECURE'),
          auth: {
            user: config.get<string>('EMAIL_USERNAME'),
            pass: config.get<string>('EMAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"htclinic" <${config.get<string>('EMAIL_FROM')}>`,
        },
        template: {
          dir: join(__dirname, 'email-templates'), // Folder for templates
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: COMMUNICATION_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'auth',
              brokers: [configService.get<string>('KAFKA_BROKER')],
            },
            consumer: {
              groupId: COMMUNICATION_CONSUMER_GROUP,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    LoggerModule,
  ],
  controllers: [CommunicationController],
  providers: [EmailService, SmsService],
})
export class CommunicationModule {}
