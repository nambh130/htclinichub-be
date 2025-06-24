import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { Logger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: 'http://localhost:8080',
    credentials: true, // nếu bạn gửi cookies hoặc Authorization header
  });


  // Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('API documentation for the API Gateway')
    .setVersion('1.0')
    .addBearerAuth() // Enables JWT auth button in Swagger UI
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document); // Available at /api

  // Global middleware and pipes
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useLogger(app.get(Logger));
  app.use(cookieParser());

  await app.listen(configService.get<number>('PORT') || 3000);
}
void bootstrap();
