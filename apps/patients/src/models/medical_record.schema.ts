import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongoAbstractDocument } from '@app/common';
import { Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class MedicalRecord extends MongoAbstractDocument {
  @Prop({ type: Types.ObjectId, ref: 'Patient' })
  patient_id: Types.ObjectId;

  @Prop()
  appointment_id: string;

  @Prop({
    type: {
      code: { type: String },
      name: { type: String },
    },
    _id: false,
  })
  icd: {
    code: string;
    name: string;
  };

  @Prop()
  symptoms: string;

  @Prop()
  diagnosis: string;

  @Prop()
  treatmentDirection: string;

  @Prop()
  next_appoint: string;
}

export const MedicalRecordSchema = SchemaFactory.createForClass(MedicalRecord);
