import { MongoAbstractDocument } from "@app/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { ImagingTemplate, ImagingTemplateSchema } from "./imaging-template.schema";

export type TestType = 'LAB' | 'IMAGING'
export enum TestEnum { LAB = 'LAB', IMAGE = 'IMAGING' }

//Base template
@Schema({ timestamps: true, discriminatorKey: 'testType' })
export class LabTest extends MongoAbstractDocument {
  @Prop()
  clinicId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  code?: string;

  @Prop({ required: true })
  price: number
}

export const LabTestSchema = SchemaFactory.createForClass(LabTest)

@Schema()
export class QuantitativeTest extends LabTest {
  @Prop({ type: [Types.ObjectId], ref: 'LabField', required: false })
  template?: Types.ObjectId[];
}
export const QuantitativeTestSchema = SchemaFactory.createForClass(QuantitativeTest)

@Schema()
export class ImagingTest extends LabTest {
  @Prop({ type: ImagingTemplateSchema, required: false })
  template?: ImagingTemplate;
}
export const ImagingTestSchema = SchemaFactory.createForClass(ImagingTest)
