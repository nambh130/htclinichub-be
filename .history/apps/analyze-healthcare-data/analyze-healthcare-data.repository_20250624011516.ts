import { AnalyzeHealthcareDataController } from './../../.history/apps/analyze-healthcare-data/analyze-healthcare-data.controller_20250624001549';
import { Injectable, Logger } from '@nestjs/common';
import { Vitals, VitalsDocument } from './models';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { MongoAbstractRepository, PostgresAbstractRepository } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
@Injectable()
export class AnalyzeHealthcareDataRepository extends MongoAbstractRepository<VitalsDocument> {
    protected readonly logger = new Logger(AnalyzeHealthcareDataRepository.name);

    constructor(
        @InjectModel(Vitals.name)
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
