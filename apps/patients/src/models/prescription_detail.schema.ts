import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongoAbstractDocument } from '@app/common';
import { Types } from 'mongoose';

export type PrescriptionDetailDocument = PrescriptionDetail & Document;

const prescribedMedicines = {
  type: [
    { 
      day: { type: Number },
      medicine_id: { type: String, required: true },
      quantity: { type: Number },
      timesPerDay: { type: Number },
      dosePerTime: { type: String },
      schedule: { type: String },
    }
  ],
  _id: false,
  default: [],
};

@Schema({ versionKey: false, timestamps: true, collection: 'prescriptions' })
export class PrescriptionDetail extends MongoAbstractDocument {
  @Prop({ type: Types.ObjectId, ref: 'MedicalRecord' })
  medical_record_id: Types.ObjectId;

  @Prop(prescribedMedicines)
  prescribedMedicines: {
    day: number;
    medicine_id: string;
    quantity: number;
    timesPerDay: number;
    dosePerTime: string;
    schedule: string;
  }[];

  @Prop()
  note: string;
}

export const PrescriptionDetailSchema = SchemaFactory.createForClass(PrescriptionDetail);
