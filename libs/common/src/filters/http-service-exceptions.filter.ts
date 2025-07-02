import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpServiceExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpServiceExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: Record<string, unknown> = {
      message: 'Internal server error',
      error: 'InternalServerError',
    };

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        errorResponse.message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        errorResponse = {
          ...errorResponse,
          ...exceptionResponse,
        };
      }
    } else if (exception instanceof Error) {
      // Handle specific database and validation errors
      status = this.getStatusCodeFromError(exception);
      errorResponse = {
        message: exception.message,
        error: exception.constructor.name,
        // Add specific error details for certain error types
        ...(this.isQueryFailedError(exception) && {
          details: {
            type: 'DatabaseError',
            code: this.extractErrorCode(exception),
          },
        }),
      };
    } else if (
      typeof exception === 'object' &&
      exception !== null &&
      'message' in exception
    ) {
      const error = exception as { message?: unknown };
      if (typeof error.message === 'string') {
        errorResponse.message = error.message;
      }
    }

    // Log the error for debugging
    const messageText = Array.isArray(errorResponse.message)
      ? errorResponse.message.join(', ')
      : (errorResponse.message as string);

    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${status} - ${messageText}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Return structured error response
    const finalResponse = {
      statusCode: status,
      ...errorResponse,
      timestamp: new Date().toISOString(),
      path: request.url,
      service: this.getServiceName(request),
    };

    // Ensure response is sent only once
    if (!response.headersSent) {
      response.status(status).json(finalResponse);
    }
  }

  private getStatusCodeFromError(error: Error): number {
    const errorName = error.constructor.name;
    const errorMessage = error.message.toLowerCase();

    switch (errorName) {
      case 'QueryFailedError':
        if (
          errorMessage.includes('does not exist') ||
          errorMessage.includes('not found')
        ) {
          return HttpStatus.NOT_FOUND;
        }
        if (
          errorMessage.includes('duplicate') ||
          errorMessage.includes('unique constraint')
        ) {
          return HttpStatus.CONFLICT;
        }
        if (errorMessage.includes('foreign key constraint')) {
          return HttpStatus.BAD_REQUEST;
        }
        if (errorMessage.includes('check constraint')) {
          return HttpStatus.BAD_REQUEST;
        }
        return HttpStatus.INTERNAL_SERVER_ERROR;

      case 'EntityNotFoundError':
        return HttpStatus.NOT_FOUND;

      case 'ValidationError':
      case 'BadRequestException':
        return HttpStatus.BAD_REQUEST;

      case 'UnauthorizedException':
      case 'UnauthorizedError':
        return HttpStatus.UNAUTHORIZED;

      case 'ForbiddenException':
      case 'ForbiddenError':
        return HttpStatus.FORBIDDEN;

      case 'ConflictException':
        return HttpStatus.CONFLICT;

      case 'NotFoundException':
        return HttpStatus.NOT_FOUND;

      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private isQueryFailedError(error: Error): boolean {
    return error.constructor.name === 'QueryFailedError';
  }

  private extractErrorCode(error: Error): string | undefined {
    // Extract PostgreSQL error codes or other database-specific codes
    if ('code' in error && typeof error.code === 'string') {
      return error.code;
    }
    return undefined;
  }

  private getServiceName(request: Request): string {
    // Extract service name from the request path or headers
    const path = request.url;
    if (path.includes('/staff/')) return 'staff-service';
    if (path.includes('/media/')) return 'media-service';
    if (path.includes('/clinic/')) return 'clinic-service';
    return 'unknown-service';
  }
}
