import { Injectable, Logger } from '@nestjs/common';
import { Patient } from './models/patients.';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { MongoAbstractRepository, PostgresAbstractRepository } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// @Injectable()
// export class PatientRepository extends PostgresAbstractRepository<Patient> {
//   protected readonly logger = new Logger(PatientRepository.name);
//   constructor(
//     @InjectRepository(Patient)
//     itemsRepository: Repository<Patient>,
//     entityManager: EntityManager,
//   ) {
//     super(itemsRepository, entityManager);
//   }

//   async findByPhone(phone: string) {
//     return this.entityRepository.findOne({ where: { phone } });
//   }
// }

@Injectable()
export class PatientRepository extends MongoAbstractRepository<Patient> {
  protected readonly logger = new Logger(PatientRepository.name);

  constructor(
    @InjectModel(Patient.name)
    reservationModel: Model<Patient>,
  ) {
    super(reservationModel);
  }
}
