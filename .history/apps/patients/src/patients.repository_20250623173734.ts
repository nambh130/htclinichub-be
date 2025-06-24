import { Injectable, Logger } from '@nestjs/common';
import { Patient, PatientDocument } from './models';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { MongoAbstractRepository, PostgresAbstractRepository } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

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
export class PatientRepository extends MongoAbstractRepository<PatientDocument> {
  protected readonly logger = new Logger(PatientRepository.name);

  constructor(
    @InjectModel(Patient.name)
    patientModel: Model<PatientDocument>,
  ) {
    super(patientModel);
  }

  async findByPhone(phone: string) {
    const existPhone = await this.patientModel.findOne({ phone });
    if (!existPhone) {
      return null;
    }
    return existPhone;
  }

  async createPatient(document: Partial<Patient>): Promise<Patient> {
    this.logger.debug(`Creating document: ${JSON.stringify(document)}`);
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (await createdDocument.save()).toJSON() as Patient;
  }
}

