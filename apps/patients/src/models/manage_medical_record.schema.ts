import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongoAbstractDocument } from '@app/common';
import { Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class ManageMedicalRecord extends MongoAbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'Patient' })
    patient_id: Types.ObjectId;

    @Prop()
    appointment_id: string;

    @Prop()
    doctor_id: string;

    @Prop()
    clinic_id: string;

    @Prop()
    symptoms: string

    @Prop()
    diagnosis: string;

    @Prop()
    next_appoint: string;
}

export const ManageMedicalRecordSchema = SchemaFactory.createForClass(ManageMedicalRecord);
