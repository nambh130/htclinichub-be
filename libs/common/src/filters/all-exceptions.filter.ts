import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let responseBody: Record<string, unknown> = {
      message: 'Internal server error',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'string') {
        responseBody.message = body;
      } else if (typeof body === 'object' && body !== null) {
        responseBody = {
          ...body,
        } as Record<string, unknown>;
      }
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      'message' in exception
    ) {
      const error = exception as { message?: unknown };
      if (typeof error.message === 'string') {
        responseBody.message = error.message;
      }
    }

    const messageText = Array.isArray(responseBody.message)
      ? responseBody.message.join(', ')
      : (responseBody.message as string);

    this.logger.error(
      `[${request.method}] ${request.url} - ${messageText}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Ensure the response is sent
    if (!response.headersSent) {
      response.status(status).json({
        statusCode: status,
        ...responseBody,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
