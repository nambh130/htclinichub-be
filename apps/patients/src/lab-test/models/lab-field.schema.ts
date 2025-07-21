import { MongoAbstractDocument } from "@app/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class LabField extends MongoAbstractDocument{
  @Prop({required: true})
  clinicId: string

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
