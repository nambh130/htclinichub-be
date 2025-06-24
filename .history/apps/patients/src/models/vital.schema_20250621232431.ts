// vitals.schema.ts
import { MongoAbstractDocument } from '@app/common';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VitalsDocument = Vitals & Document;

@Schema({ versionKey: false, timestamps: true })
export class Vitals extends MongoAbstractDocument{
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ type: Number, min: 0, max: 100 })
  spo2?: number;

  @Prop({ type: Number, min: 0 })
  heartRate?: number;

  @Prop({ type: Number, min: 0 })
  respiratoryRate?: number;

  @Prop({ type: Number })
  temperature?: number;

  @Prop({
    type: {
      systolic: { type: Number },
      diastolic: { type: Number },
    },
    _id: false,
  })
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };

  @Prop({ type: String, enum: ['wearable', 'manual', 'nurse'], default: 'manual' })
  source: string;
}

export const VitalsSchema = SchemaFactory.createForClass(Vitals);
