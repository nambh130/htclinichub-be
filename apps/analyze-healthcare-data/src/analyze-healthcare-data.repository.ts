import { Injectable, Logger } from '@nestjs/common';
import { Vitals, VitalsDocument } from '../models';
import { MongoAbstractRepository } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
@Injectable()
export class AnalyzeHealthcareDataRepository extends MongoAbstractRepository<VitalsDocument> {
    protected readonly logger = new Logger(AnalyzeHealthcareDataRepository.name);

    constructor(
        @InjectModel(Vitals.name, 'patientService')
        vitalsModel: Model<VitalsDocument>,
    ) {
        super(vitalsModel);
    }
    async insertVitalSigns(document: Partial<Vitals>): Promise<Vitals> {
        this.logger.debug(`Creating document: ${JSON.stringify(document)}`);
        const createdDocument = new this.model({
            ...document,
            _id: new Types.ObjectId(),
        });
        return (await createdDocument.save()).toJSON() as Vitals;
    }
}
