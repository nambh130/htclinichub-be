import { Injectable, Logger } from '@nestjs/common';
import { PostgresAbstractRepository } from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Employee } from '../models/employee.entity';

@Injectable()
export class EmployeeRepository extends PostgresAbstractRepository<Employee> {
  protected readonly logger = new Logger(EmployeeRepository.name);

  private readonly itemsRepository: Repository<Employee>;

  constructor(
    @InjectRepository(Employee)
    itemsRepository: Repository<Employee>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
    this.itemsRepository = itemsRepository;
  }

  async checkEmployeeEmailExists(email: string): Promise<boolean> {
    const normalizedEmail = email.trim().toLowerCase();
    const employee = await this.itemsRepository.findOne({
      where: { email: normalizedEmail },
    });
    return employee !== null;
  }
}
