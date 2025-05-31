import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { Logger, NotFoundException } from '@nestjs/common';
import { AbstractDocument } from './abstract.schema';
import { IBaseRepository } from './abstract.repository.interface';

export abstract class AbstractMongoRepository<TDocument extends AbstractDocument>
  implements IBaseRepository<TDocument>
{
  protected abstract readonly logger: Logger;
  constructor(protected readonly model: Model<TDocument>) {}

  async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
    this.logger.debug(`Creating document: ${JSON.stringify(document)}`);
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (await createdDocument.save()).toJSON() as TDocument;
  }

  async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument | null> {
    return this.model.findOne(filterQuery).lean<TDocument>(true);
  }

  async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
    return this.model.find(filterQuery).lean<TDocument[]>(true);
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument | null> {
    return this.model
      .findOneAndUpdate(filterQuery, update, { new: true })
      .lean<TDocument>(true);
  }

  async findOneAndDelete(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument | null> {
    return this.model.findOneAndDelete(filterQuery).lean<TDocument>(true);
  }
}