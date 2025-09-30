import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ActorType } from '@app/common';
import { Doctor } from '../models/doctor.entity';
import { Employee } from '../models/employee.entity';

@Injectable()
export class CommonRepository {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async findActorWithIdAndType(
    type: ActorType,
    id: string,
  ): Promise<{ email: string } | null> {
    if (!type || !id) return null;

    switch (type) {
      case 'doctor':
        return this.entityManager.findOne(Doctor, {
          where: { id },
          select: ['email'],
        });
      case 'employee':
        return this.entityManager.findOne(Employee, {
          where: { id },
          select: ['email'],
        });
      default:
        return null;
    }
  }
}
