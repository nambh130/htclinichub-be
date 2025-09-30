import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { LabTestResult } from "./lab-result.schema";

@Schema()
export class LabResultField {
  @Prop({ required: true })
  fieldName: string;

  @Prop({ required: true })
  value: number;

  @Prop()
  unit?: string;

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

  @Prop()
  takenByMachine?: string;
}

export const LabResultFieldSchema = SchemaFactory.createForClass(LabResultField);

// -----------------------------
// QuantitativeTestResult Schema
// -----------------------------

@Schema()
export class QuantitativeTestResult extends LabTestResult {
  @Prop({ type: [LabResultFieldSchema], default: [] })
  result: LabResultField[];
}

export const QuantitativeTestResultSchema = SchemaFactory.createForClass(QuantitativeTestResult);
