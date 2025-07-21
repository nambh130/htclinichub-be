import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { LabTestResult } from "./lab-result.schema";

@Schema()
export class ImagingResultData {
  @Prop()
  description?: string;

  @Prop()
  conclusion?: string;

  @Prop({ type: [String] })
  images?: string[];
}

export const ImagingResultDataSchema = SchemaFactory.createForClass(ImagingResultData);

// -----------------------------
// ImagingTestResult Schema
// -----------------------------

@Schema()
export class ImagingTestResult extends LabTestResult {
  @Prop({ type: [ImagingResultDataSchema], default: [] })
  result: ImagingResultData[];
}

export const ImagingTestResultSchema = SchemaFactory.createForClass(ImagingTestResult);
