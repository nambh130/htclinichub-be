import { MongoAbstractDocument } from "@app/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema()
export class LabOrder extends MongoAbstractDocument {
  @Prop()
  orderDate: Date

  @Prop({ type: Types.ObjectId, ref: 'MedicalRecord' })
  medicalReport: Types.ObjectId

  @Prop()
  name: string

  @Prop({type: [Types.ObjectId], ref: 'LabOrderItem'})
  orderItems: Types.ObjectId[]
}

export const LabOrderSchema = SchemaFactory.createForClass(LabOrder);

