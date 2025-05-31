import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { AbstractEntity } from './abstract.entity';
import { IBaseRepository } from './abstract.repository.interface';

export abstract class AbstractTypeOrmRepository<T extends AbstractEntity>
  implements IBaseRepository<T>
{
  protected abstract readonly logger: Logger;
  constructor(protected readonly repository: Repository<T>) {}

  async create(document: Partial<T>): Promise<T> {
    this.logger?.debug?.(`Creating entity: ${JSON.stringify(document)}`);
    const entity = this.repository.create(
      document as import('typeorm').DeepPartial<T>,
    );
    return await this.repository.save(entity);
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    return this.repository.findOneBy(
      filter as import('typeorm').FindOptionsWhere<T>,
    );
  }

  async find(filter: Partial<T>): Promise<T[]> {
    return this.repository.findBy(
      filter as import('typeorm').FindOptionsWhere<T>,
    );
  }

  async findOneAndUpdate(
    filter: Partial<T>,
    update: Partial<T>,
  ): Promise<T | null> {
    const entity = await this.repository.findOneBy(
      filter as import('typeorm').FindOptionsWhere<T>,
    );
    if (!entity) return null;
    Object.assign(entity, update);
    return await this.repository.save(entity);
  }

  async findOneAndDelete(filter: Partial<T>): Promise<T | null> {
    const entity = await this.repository.findOneBy(
      filter as import('typeorm').FindOptionsWhere<T>,
    );
    if (!entity) return null;
    await this.repository.remove(entity);
    return entity;
  }
}
