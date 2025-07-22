import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { LabTestResult } from "./lab-result.schema";

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


