import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { LabTestResult } from "./lab-result.schema";

@Schema()
export class ImagingResultData {
  @Prop()
  description?: string;

  @Prop()
  conclusion?: string;

  @Prop({
    type: [
      {
        id: { type: String },
        url: { type: String },
      },
    ],
    default: [],
  })
  images?: { id: string; url: string }[];

  @Prop({
    type: [
      {
        id: { type: String },
        url: { type: String },
      },
    ],
    default: [],
  })
  dicoms?: { id: string; url: string }[];
}

export const ImagingResultDataSchema = SchemaFactory.createForClass(ImagingResultData);

// -----------------------------
// ImagingTestResult Schema
// -----------------------------

@Schema()
export class ImagingTestResult extends LabTestResult {
  @Prop({ type: ImagingResultDataSchema, default: [] })
  result: ImagingResultData;
}

export const ImagingTestResultSchema = SchemaFactory.createForClass(ImagingTestResult);
