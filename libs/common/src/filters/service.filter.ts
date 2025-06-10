import { Logger } from '@nestjs/common';

export abstract class BaseService {
  private readonly logger = new Logger(BaseService.name);

  protected async handleExceptions<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error: unknown) {
      this.logger.error('Error occurred:', error);
      throw error;
    }
  }
}
