//import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
//import { LabTemplateSchema } from "./quantitative-template.schem";
//import { ImagingTemplateSchema } from "./imaging-template.schema";
//
//@Schema({ discriminatorKey: 'tesType', _id: true })
//export class TestTemplate {
//  @Prop({ required: true })
//  name: string;
//
//  @Prop()
//  description?: string;
//
//  @Prop({ required: true, enum: ['LAB', 'IMAGING'] })
//  testType: 'lab' | 'imaging';
//}
//
//export const TestTemplateSchema = SchemaFactory.createForClass(TestTemplate);
//
//TestTemplateSchema.discriminator('Lab', LabTemplateSchema);
//TestTemplateSchema.discriminator('Imaging', ImagingTemplateSchema);
