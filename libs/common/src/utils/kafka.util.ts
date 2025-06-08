import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

interface RpcErrorPayload {
  statusCode?: number;
  message?: string | string[];
  [key: string]: unknown;
}

function isRpcErrorPayload(error: unknown): error is RpcErrorPayload {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('message' in error || 'statusCode' in error)
  );
}

function isErrorWithMessage(error: unknown): error is { message: string } {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const maybeMessage = (error as Record<string, unknown>).message;
    return typeof maybeMessage === 'string';
  }
  return false;
}

export async function safeKafkaCall<T>(obs: Observable<T>): Promise<T> {
  try {
    return await firstValueFrom(obs);
  } catch (err: unknown) {
    if (err instanceof RpcException) {
      const error = err.getError();

      if (isRpcErrorPayload(error)) {
        return Promise.reject(
          new HttpException(
            {
              message: error.message ?? 'Kafka error',
              ...error,
            },
            error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        );
      }

      if (typeof error === 'string') {
        return Promise.reject(
          new HttpException(
            { message: error },
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        );
      }
    }

    const errorMessage = isErrorWithMessage(err)
      ? err.message
      : 'Kafka communication failed';

    return Promise.reject(new InternalServerErrorException(errorMessage));
  }
}
