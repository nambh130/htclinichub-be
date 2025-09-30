import { MongoAbstractDocument } from '@app/common';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VitalsDocument = Vitals & Document;
const bloodPressureValue = {
    type: {
        systolic: { type: Number },
        diastolic: { type: Number },
    },
    _id: false,
}

const glucoseLevelValue = {
    type: {
        min: { type: Number },
        max: { type: Number },
    },
    _id: false,
}

@Schema({ versionKey: false, timestamps: true })
export class Vitals extends MongoAbstractDocument {
    @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
    patientId: Types.ObjectId;

    @Prop({ type: Number, min: 0, max: 100 })
    spo2?: number;

    @Prop({ type: Number, min: 0 })
    heartRate?: number;

    @Prop({ type: Number, min: 0 })
    respiratoryRate?: number;

    @Prop({ type: Number })
    temperature?: number;

    @Prop({ type: Number })
    weight?: number;

    @Prop({ type: Number })
    height?: number;

    @Prop({ type: Number })
    bmi?: number;

    @Prop(glucoseLevelValue)
    glucoseLevel?: {
        min: number;
        max: number;
    };

    @Prop(bloodPressureValue)
    bloodPressure?: {
        systolic: number;
        diastolic: number;
    };

    // @Prop({
    //     type: String,
    //     enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    //     default: 'O+'
    // })
    // bloodGroup: string;

    @Prop({ type: String, enum: ['wearable', 'manual', 'nurse'], default: 'manual' })
    source: string;

    @Prop({ type: String, default: null })
    mRId: string;
}

export const VitalsSchema = SchemaFactory.createForClass(Vitals);
