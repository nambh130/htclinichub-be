import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

interface KafkaErrorResponse {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  details?: any;
  timestamp?: string;
  [key: string]: unknown;
}

function isKafkaErrorResponse(error: unknown): error is KafkaErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('message' in error || 'statusCode' in error || 'error' in error)
  );
}

export async function safeKafkaCall<T>(obs: Observable<T>): Promise<T> {
  try {
    return await firstValueFrom(obs);
  } catch (err: unknown) {
    // Check if it's our formatted error response from the microservice
    if (isKafkaErrorResponse(err)) {
      const statusCode = err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;

      // Create response body, preserving all error information
      const responseBody: Record<string, unknown> = {
        message: err.message || 'Microservice error',
        error: err.error || 'MicroserviceError',
      };

      // Include additional details if available
      if (err.details) {
        responseBody.details = err.details;
      }

      // Add any other properties from the error
      Object.keys(err).forEach((key) => {
        if (!['statusCode', 'message', 'error', 'details'].includes(key)) {
          responseBody[key] = err[key];
        }
      });

      return Promise.reject(new HttpException(responseBody, statusCode));
    }

    // Handle RpcException (fallback)
    if (err instanceof RpcException) {
      const error = err.getError();

      if (isKafkaErrorResponse(error)) {
        return Promise.reject(
          new HttpException(
            error,
            error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        );
      }

      if (typeof error === 'string') {
        return Promise.reject(
          new HttpException(
            { message: error, error: 'RpcError' },
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        );
      }
    }

    // Handle other errors
    const errorMessage =
      err instanceof Error ? err.message : 'Kafka communication failed';

    return Promise.reject(
      new InternalServerErrorException({
        message: errorMessage,
        error: 'KafkaCommunicationError',
      }),
    );
  }
}
