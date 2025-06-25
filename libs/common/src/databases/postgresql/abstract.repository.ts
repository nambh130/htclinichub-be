import { Logger, NotFoundException } from '@nestjs/common';
import { PostgresAbstractEntity } from './abstract.entity';
import {
  EntityManager,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export abstract class PostgresAbstractRepository<
  T extends PostgresAbstractEntity<T>,
> {
  protected abstract readonly logger: Logger;
  constructor(
    private readonly entityRepository: Repository<T>,
    private readonly entityManager: EntityManager,
  ) {}

  async findAll(): Promise<T[]> {
    return this.entityRepository.find();
  }

  async find(where: FindOptionsWhere<T>): Promise<T[]> {
    return this.entityRepository.findBy(where);
  }

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

  async create(entity: T): Promise<T> {
    console.log("enity",entity)
    return this.entityManager.save(entity);
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
}
