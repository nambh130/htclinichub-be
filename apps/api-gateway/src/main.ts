import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { Logger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule, {
    bufferLogs: true,
  });
  app.enableCors({

    //8080: doctor, 8082: admin, 8081: patient
    origin: ['http://localhost:8080', 'http://localhost:8000', 'http://localhost:8082', 'http://localhost:8081'], // allow requests from these origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // allow cookies/auth headers
  });
  
  // Get ConfigService and Logger
  const configService = app.get(ConfigService);
  app.useLogger(app.get(Logger));

  // Global route prefix
  app.setGlobalPrefix('api');

  // Global middleware
  app.use(cookieParser());

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      // transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('API documentation for the API Gateway')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Start the app
  const port = configService.get<number>('API_GATEWAY_PORT') as number;
  await app.listen(port);
  app
    .get(Logger)
    .log(`🚀 API Gateway is running on http://localhost:${port}/api`);
}

void bootstrap();
