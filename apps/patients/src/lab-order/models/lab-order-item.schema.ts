import { MongoAbstractDocument } from "@app/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema()
export class LabOrderItem extends MongoAbstractDocument {
  @Prop()
  price: number

  @Prop({ default: false })
  isDone: boolean

  @Prop()
  status: string

  @Prop({ type: Types.ObjectId, ref: 'LabTest' })
  labTest: Types.ObjectId

}

export const LabOrderItemSchema = SchemaFactory.createForClass(LabOrderItem);

