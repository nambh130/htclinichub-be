import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export enum BarcodeCounterName {
  LAB_ORDER = 'lab_order',
  LAB_ORDER_ITEM = 'lab_order_item',
  INVOICE = 'invoice',
  PATIENT = 'patient',
  MEDICAL_RECORD = 'medical_record',
}

export type BarcodeConunterType = 'lab_order' | 'invoice' | 'patient' | 'medical_record' | 'lab_order_item';

@Schema()
export class BarcodeCounter {
  @Prop({ required: true })
  name: BarcodeConunterType;

  @Prop({ required: true })
  clinicId: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true, default: 0 })
  seq: number;
}

export const BarcodeCounterSchema = SchemaFactory.createForClass(BarcodeCounter);
BarcodeCounterSchema.index({ name: 1, clinicId: 1, date: 1 }, { unique: true });
