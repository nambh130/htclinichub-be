// Add this to your staff microservice (not the API gateway)
import { Catch, ExceptionFilter, ArgumentsHost, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch()
export class KafkaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(KafkaExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost): Observable<never> {
    const _ctx = host.switchToRpc();

    let errorResponse = {
      statusCode: 500,
      message: 'Internal server error',
      error: 'InternalServerError',
      timestamp: new Date().toISOString(),
    };

    // Log the original exception for debugging
    this.logger.error('Exception caught in Kafka microservice:', exception);

    if (exception instanceof RpcException) {
      const rpcError = exception.getError();

      if (typeof rpcError === 'object' && rpcError !== null) {
        errorResponse = {
          ...errorResponse,
          ...rpcError,
        };
      } else if (typeof rpcError === 'string') {
        errorResponse.message = rpcError;
      }
    } else if (exception instanceof Error) {
      // Handle regular errors
      errorResponse = {
        statusCode: this.getStatusCodeFromError(exception),
        message: exception.message,
        error: exception.constructor.name,
        timestamp: new Date().toISOString(),
        // Include additional details for specific error types
        ...(exception.constructor.name === 'QueryFailedError' && {
          details: {
            type: 'DatabaseError',
            originalMessage: exception.message,
          },
        }),
      };
    } else {
      // Handle unknown errors
      errorResponse.message = 'Unknown error occurred';
      errorResponse.error = 'UnknownError';
    }

    // Return the error as a throwError observable
    // This ensures the error gets properly serialized and sent back through Kafka
    return throwError(() => errorResponse);
  }

  private getStatusCodeFromError(error: Error): number {
    switch (error.constructor.name) {
      case 'QueryFailedError':
        if (error.message.includes('does not exist')) {
          return 400; // Bad Request
        }
        if (
          error.message.includes('duplicate') ||
          error.message.includes('unique constraint')
        ) {
          return 409; // Conflict
        }
        return 500;

      case 'EntityNotFoundError':
        return 404;

      case 'ValidationError':
        return 400;

      case 'UnauthorizedError':
        return 401;

      case 'ForbiddenError':
        return 403;

      default:
        return 500;
    }
  }
}
