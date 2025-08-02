import { MongoAbstractDocument } from "@app/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
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

  // No need prop because discriminatorKey
  testType?: TestType;

  @Prop()
  code?: string;

  @Prop({ required: true })
  price: number
}

export const LabTestSchema = SchemaFactory.createForClass(LabTest)

@Schema()
export class LabField {
  @Prop({ required: false })
  loincCode?: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  unit: string;

  @Prop({
    type: {
      low: Number,
      high: Number,
    },
    required: true
  })
  referenceRange?: {
    low: number;
    high: number;
  };
}
export const LabFieldSchema = SchemaFactory.createForClass(LabField);

@Schema()
export class QuantitativeTest extends LabTest {
  @Prop({ type: [LabFieldSchema], required: false })
  template?: LabField[];
}
export const QuantitativeTestSchema = SchemaFactory.createForClass(QuantitativeTest)

@Schema()
export class ImagingTest extends LabTest {
  @Prop({ type: ImagingTemplateSchema, required: false })
  template?: ImagingTemplate;
}
export const ImagingTestSchema = SchemaFactory.createForClass(ImagingTest)
