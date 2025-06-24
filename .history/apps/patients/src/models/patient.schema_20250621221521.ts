import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongoAbstractDocument } from '@app/common';

@Schema({ versionKey: false, timestamps: true })
export class PatientDocument extends MongoAbstractDocument {
  @Prop()
  fullname: string;

  @Prop()
  phone: string;

  @Prop()
  gender: string;

  @Prop()
  gender: string;

  @Prop()
  nation: string;

  @Prop()
  work_address: string;

  @Prop({
    type: {
      allergies: { type: String },
      personal_history: { type: String },
      family_history: { type: String },
    },
    _id: false, 
  })
  medical_history: {
    allergies: string;
    personal_history: string;
    family_history: string;
  };
}

export const PatientSchema = SchemaFactory.createForClass(PatientDocument);
