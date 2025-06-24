import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongoAbstractDocument } from '@app/common';

const medicalHistoryDocument = {
    type: {
      allergies: { type: String },
      personal_history: { type: String },
      family_history: { type: String },
    },
    _id: false, 
  }

@Schema({ versionKey: false, timestamps: true })
export class PatientDocument extends MongoAbstractDocument {
  @Prop()
  id: string;

  @Prop()
  patient_account_id: string;

  @Prop()
  fullname: string;
  
  @Prop()
  relation: string;

  @Prop()
  ethnicity: string;

  

  @Prop()
  phone: string;

  @Prop()
  gender: string;

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
}

export const PatientSchema = SchemaFactory.createForClass(PatientDocument);
