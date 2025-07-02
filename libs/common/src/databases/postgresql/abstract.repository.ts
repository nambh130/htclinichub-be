import {
  EntityManager,
  FindOptionsRelations,
  FindOptionsWhere,
  FindOptionsOrder,
  Repository,
  DeepPartial,
  In,
} from 'typeorm';
import { Logger, NotFoundException } from '@nestjs/common';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PostgresAbstractEntity } from './abstract.entity';

export abstract class PostgresAbstractRepository<
  T extends PostgresAbstractEntity<T>,
> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly entityRepository: Repository<T>,
    private readonly entityManager: EntityManager,
  ) {}

  //async findAll(): Promise<T[]> {
  //  return this.entityRepository.find();
  //}

  // Create
  async create(entity: T): Promise<T> {
    return this.entityManager.save(entity);
  }

  async update(entity: T, partialEntity: DeepPartial<T>): Promise<T> {
    const updatedEntity = this.entityRepository.merge(entity, partialEntity);
    return await this.entityRepository.save(updatedEntity);
  }

  // Find one
  async findOne(
    where: FindOptionsWhere<T>,
    relations?: string[] | FindOptionsRelations<T>,
  ): Promise<T> {
    const entity = await this.entityRepository.findOne({ where, relations });

    if (!entity) {
      this.logger.warn(`Entity not found for query: ${JSON.stringify(where)}`);
      throw new NotFoundException('Entity not found');
    }

    return entity;
  }

  async paginate(
    options: {
      where?: FindOptionsWhere<T>;
      page?: number;
      limit?: number;
      order?: FindOptionsOrder<T>;
      relations?: string[];
    } = {},
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      where = {},
      page = 1,
      limit = 10,
      order = { createdAt: 'DESC' } as FindOptionsOrder<T>,
      relations = [],
    } = options;

    const [data, total] = await this.entityRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order,
      relations,
    });

    return { data, total, page, limit };
  }

  async findOneAndUpdate(
    where: FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
  ): Promise<T> {
    const updateResult = await this.entityRepository.update(
      where,
      partialEntity,
    );

    if (!updateResult.affected) {
      this.logger.warn(`Entity not found for query: ${JSON.stringify(where)}`);
      throw new NotFoundException('Entity not found');
    }
    return this.findOne(where);
  }

  async findOneAndDelete(where: FindOptionsWhere<T>) {
    await this.entityRepository.delete(where);
  }

  async findAndCount(
    where: FindOptionsWhere<T>,
    skip?: number,
    take?: number,
    relations?: string[],
  ): Promise<[T[], number]> {
    return this.entityRepository.findAndCount({
      where,
      skip,
      take,
      relations,
    });
  }
  // Find many by condition
  async find(where: FindOptionsWhere<T>): Promise<T[]> {
    return this.entityRepository.findBy(where);
  }

  // Hard Delete
  async delete(where: FindOptionsWhere<T>): Promise<void> {
    await this.entityRepository.delete(where);
  }

  // Find All with optional pagination, order, relations and soft delete filter
  async findAll(options?: {
    where?: FindOptionsWhere<T>;
    relations?: FindOptionsRelations<T>;
    order?: FindOptionsOrder<T>;
    page?: number;
    limit?: number;
    withDeleted?: boolean; // mặc định exclude soft deleted
  }): Promise<{ data: T[]; total: number; page: number; limit: number }> {
    const {
      where,
      relations,
      order,
      page = 1,
      limit = 10,
      withDeleted = false,
    } = options || {};

    const skip = (page - 1) * limit;

    const queryWhere = {
      ...(where as object),
      ...(withDeleted ? {} : { deletedAt: null }),
    } as FindOptionsWhere<T>;

    const [data, total] = await this.entityRepository.findAndCount({
      where: queryWhere,
      relations,
      order,
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }
  async findMany(where: FindOptionsWhere<T>): Promise<T[]> {
    return this.entityRepository.find({ where });
  }
}
