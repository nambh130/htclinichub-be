import { ActorType } from '@app/common';
import { Prop, Schema } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ timestamps: true })
export class MongoAbstractDocument {
  @Prop({ type: SchemaTypes.ObjectId })
  _id: Types.ObjectId;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop({ type: String, required: false })
  createdById?: string;

  @Prop({
    type: String,
    enum: ['doctor', 'employee', 'patient'],
    required: false,
  })
  createdByType?: ActorType;

  @Prop({ type: String, required: false })
  updatedById?: string;

  @Prop({
    type: String,
    enum: ['doctor', 'employee', 'patient', 'admin'],
    required: false,
  })
  updatedByType?: ActorType;

  @Prop({ type: Boolean, default: false })
  isDeleted?: boolean;

  @Prop({ type: Date, required: false })
  deletedAt?: Date;

  @Prop({ type: String, required: false })
  deletedById?: string;

  @Prop({
    type: String,
    enum: ['doctor', 'employee', 'patient', 'admin'],
    required: false,
  })
  deletedByType?: ActorType;
}
