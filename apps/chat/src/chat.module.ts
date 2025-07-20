// apps/chat/src/chat.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
import { JwtModule } from '@nestjs/jwt'; // Register JWT for token decoding/verification

import { LoggerModule } from '@app/common'; // Shared Pino logger module

import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
import { Message, MessageSchema } from './schemas/message.schema';

@Module({
  imports: [
    /**
     * 1. Global ConfigModule with environment variable validation using Joi
     *    Ensures required values (e.g., Mongo URI, port, JWT secret) are provided at runtime
     */
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        CHAT_SERVICE_URI: Joi.string().required(),
        CHAT_SERVICE_PORT: Joi.number().required(),
        KAFKA_BROKER: Joi.string().required(),
        JWT_SECRET: Joi.string().required(), // Used to verify WebSocket tokens
      }),
    }),

    /**
     * 2. Async connection to MongoDB using values from ConfigService
     */
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('CHAT_SERVICE_URI', 'mongodb://localhost:27017/chat_service'),
      }),
      inject: [ConfigService],
    }),

    /**
     * 3. Register schemas for Conversation and Message models
     */
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),

    /**
     * 4. Register JWT for token decoding/verification
     */
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),

    // Shared logger module using Pino for structured logging
    LoggerModule,

  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
