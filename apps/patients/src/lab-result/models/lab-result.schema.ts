import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema()
export class LabResultField {
  @Prop({ required: true })
  fieldName: string;

  @Prop({ required: true })
  value: any;

  @Prop()
  unit?: string;

  @Prop()
  referenceRange?: string;
}

export const LabResultFieldSchema = SchemaFactory.createForClass(LabResultField);

@Schema()
export class ImagingResultData {
  @Prop()
  report?: string;

  @Prop({ type: [String] })
  images?: string[];
}

export const ImagingResultDataSchema = SchemaFactory.createForClass(ImagingResultData);

@Schema()
export class TestResult {
  @Prop({ type: Types.ObjectId, ref: 'TestOrder', required: true, unique: true })
  testOrder: Types.ObjectId;

  @Prop({ default: Date.now })
  completedAt: Date;

  @Prop({
    type: {
      lab: [LabResultFieldSchema],
      imaging: ImagingResultDataSchema,
    },
  })
  resultData: {
    lab?: LabResultField[];
    imaging?: ImagingResultData;
  };
}

export const TestResultSchema = SchemaFactory.createForClass(TestResult);
