import { FileCategory, MongoAbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false, timestamps: true })
export class MediaDocument extends MongoAbstractDocument {
  @Prop({ required: true })
  publicId: string;

  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    type: String,
    enum: ['image', 'pdf', 'document', 'other'],
  })
  type: FileCategory;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  domain: string;

  @Prop({ required: false })
  mimetype?: string;

  @Prop({ required: false })
  originalName?: string;

  @Prop({ required: false })
  size?: number;
}

export const MediaSchema = SchemaFactory.createForClass(MediaDocument);
