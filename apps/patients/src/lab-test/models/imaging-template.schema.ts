import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

// 2b. ImagingTemplate
@Schema()
export class ImagingTemplate {
  @Prop()
  description: string;

  @Prop()
  conclusion: string;
}

export const ImagingTemplateSchema = SchemaFactory.createForClass(ImagingTemplate);
