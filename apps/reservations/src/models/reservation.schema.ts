import { MongoAbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class ReservationDocument extends MongoAbstractDocument {
  @Prop()
  timestamp: Date;

  @Prop()
  userId: string;

  @Prop()
  placeId: string;
}

export const ReservationSchema =
  SchemaFactory.createForClass(ReservationDocument);
