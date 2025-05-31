export interface IBaseRepository<T> {
  create(document: Partial<T>): Promise<T>;
  findOne(filter: Partial<T>): Promise<T | null>;
  find(filter: Partial<T>): Promise<T[]>;
  findOneAndUpdate?(filter: Partial<T>, update: Partial<T>): Promise<T | null>;
  findOneAndDelete?(filter: Partial<T>): Promise<T | null>;
}