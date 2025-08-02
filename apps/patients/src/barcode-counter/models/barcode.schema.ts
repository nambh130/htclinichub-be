// counter.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum BarcodeCounterName {
  LAB_ORDER = 'lab_order',
  INVOICE = 'invoice',
  PATIENT = 'patient',
  MEDICAL_RECORD = 'medical_record',
}
export type BarcodeConunterType = 'lab_order' | 'invoice' | 'patient' | 'medical_record'

@Schema()
export class BarcodeCounter extends Document {
  @Prop({
    type: String,
    enum: Object.values(BarcodeCounterName),
    required: true, unique: true
  })
  name: BarcodeConunterType;

  @Prop({ required: true, default: 0 })
  seq: number;
}

export const BarcodeCounterSchema = SchemaFactory.createForClass(BarcodeCounter);
