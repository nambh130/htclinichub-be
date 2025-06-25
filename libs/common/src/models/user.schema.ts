import { MongoAbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class UserDocument extends MongoAbstractDocument {
  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  type: string;

  @Prop()
  role?: string[];
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
