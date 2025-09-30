import { Injectable, Logger } from '@nestjs/common';
import { FavouriteDoctor } from '../models/favourite_doctor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PostgresAbstractRepository } from '@app/common';

@Injectable()
export class FavouriteDoctorRepository extends PostgresAbstractRepository<FavouriteDoctor> {
    protected readonly logger = new Logger(FavouriteDoctorRepository.name);
    constructor(
        @InjectRepository(FavouriteDoctor)
        itemsRepository: Repository<FavouriteDoctor>,
        entityManager: EntityManager,
    ) {
        super(itemsRepository, entityManager);
    }

    async checkExistedDoctor(condition: Partial<FavouriteDoctor>) {
        return this.entityRepository.findOne({ where: condition });
    }
}
