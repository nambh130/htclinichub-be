import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongoAbstractDocument } from '@app/common';

@Schema({ versionKey: false })
export class PatientDocument extends MongoAbstractDocument {
  @Prop()
  fullname: string;

  @Prop()
  phone: string;

  @Prop()
  gender: string;

  @Prop()
  nation: string;

  @Prop()
  work_address: string;

  // ✅ Embedded medical_history inline
  @Prop({
    type: {
      allergies: { type: String },
      personal_history: { type: String },
      family_history: { type: String },
    },
    _id: false, // không cần _id cho embedded object
  })
  medical_history: {
    allergies: string;
    personal_history: string;
    family_history: string;
  };
}

export const PatientSchema = SchemaFactory.createForClass(PatientDocument);
