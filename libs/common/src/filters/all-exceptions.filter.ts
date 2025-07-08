import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AxiosError } from 'axios';
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
    } else if (this.isAxiosError(exception)) {
      // Handle axios errors from HTTP service calls
      const axiosError = exception as AxiosError;
      if (axiosError.response) {
        // The service returned an error response - extract all details
        status = axiosError.response.status;
        const serviceErrorData = axiosError.response.data;

        if (typeof serviceErrorData === 'object' && serviceErrorData !== null) {
          responseBody = {
            ...serviceErrorData,
            // Ensure we have these fields even if the service doesn't provide them
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
          };
        } else {
          responseBody = {
            statusCode: status,
            message: serviceErrorData || 'Service error',
            timestamp: new Date().toISOString(),
            path: request.url,
          };
        }
      } else if (axiosError.request) {
        // The service didn't respond
        status = HttpStatus.SERVICE_UNAVAILABLE;
        responseBody = {
          statusCode: status,
          message: 'Service unavailable - no response from service',
          error: 'ServiceUnavailable',
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      } else {
        // Something else happened during request setup
        status = HttpStatus.BAD_GATEWAY;
        responseBody = {
          statusCode: status,
          message: axiosError.message || 'Request setup failed',
          error: 'BadGateway',
          timestamp: new Date().toISOString(),
          path: request.url,
        };
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
      `[API Gateway] [${request.method}] ${request.url} - Status: ${status} - ${messageText}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Ensure the response is sent
    if (!response.headersSent) {
      response.status(status).json(responseBody);
    }
  }

  private isAxiosError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'isAxiosError' in error &&
      (error as AxiosError).isAxiosError === true
    );
  }
}
