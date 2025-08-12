import {
  ActorType,
  LabStatusEnum,
  LabStatusType,
  MongoAbstractDocument,
} from '@app/common';
import { ActorEnum } from '@app/common/enum/actor-type';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class LabOrderItem extends MongoAbstractDocument {
  @Prop({ required: false })
  barcode: string;

  @Prop()
  price: number;

  @Prop({
    type: String,
    enum: Object.values(LabStatusEnum),
    default: LabStatusEnum.PENDING,
  })
  status: LabStatusType;

  @Prop({ type: Types.ObjectId, ref: 'LabTest' })
  labTest: Types.ObjectId;

  @Prop()
  sampleTakenAt?: Date;

  @Prop({
    type: {
      userId: String,
      userType: {
        type: String,
        enum: Object.values(ActorEnum),
      },
    },
  })
  sampleTakenBy?: {
    userId: string;
    userType: ActorType;
  };
}

export const LabOrderItemSchema = SchemaFactory.createForClass(LabOrderItem);
