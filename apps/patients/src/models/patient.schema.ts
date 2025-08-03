import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongoAbstractDocument } from '@app/common';

export type PatientDocument = Patient & Document;
const medicalHistoryDocument = {
  type: {
    allergies: { type: String },
    personal_history: { type: String },
    family_history: { type: String },
  },
  _id: false,
};

@Schema({ versionKey: false, timestamps: true })
export class Patient extends MongoAbstractDocument {
  @Prop()
  patient_account_id: string;
  @Prop()
  clinic_id: string;
  @Prop()
  fullname: string;

  @Prop({
    type: String,
    enum: [
      'Chính chủ',
      'Chồng',
      'Vợ',
      'Con',
      'Bố',
      'Mẹ',
      'Ông',
      'Bà',
      'Chị',
      'Anh',
      'Em',
      'Cháu',
      'Khác',
    ],
    default: 'Khác',
  })
  relation: string;

  @Prop({ unique: true, sparse: true })
  citizen_id: string;

  @Prop({ unique: true, sparse: true })
  health_insurance_id: string;

  @Prop()
  ethnicity: string;

  @Prop()
  marital_status: string;

  @Prop()
  address1: string;

  @Prop()
  address2: string;

  @Prop()
  phone: string;

  @Prop()
  gender: boolean;

  @Prop()
  dOB: string;

  @Prop()
  nation: string;

  @Prop()
  work_address: string;

  @Prop(medicalHistoryDocument)
  medical_history: {
    allergies: string;
    personal_history: string;
    family_history: string;
  };

  @Prop({
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    default: 'O+',
  })
  bloodGroup: string;

  @Prop()
  createdBy: string;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
