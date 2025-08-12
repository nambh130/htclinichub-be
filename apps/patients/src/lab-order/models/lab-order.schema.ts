import { MongoAbstractDocument } from "@app/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { TestEnum, TestType } from "../../lab-test/models/lab-test.schema";

@Schema()
export class LabOrder extends MongoAbstractDocument {
  @Prop()
  clinicId: string

  @Prop()
  orderDate: Date

  @Prop({ required: false })
  barCode?: string

  @Prop({ type: Types.ObjectId, ref: 'MedicalRecord' })
  medicalRecord: Types.ObjectId

  @Prop({
    type: String,
    enum: Object.values(TestEnum),
    required: true
  })
  type: TestType

  @Prop()
  name: string

  @Prop({ type: [Types.ObjectId], ref: 'LabOrderItem' })
  orderItems: Types.ObjectId[]
}

export const LabOrderSchema = SchemaFactory.createForClass(LabOrder);

