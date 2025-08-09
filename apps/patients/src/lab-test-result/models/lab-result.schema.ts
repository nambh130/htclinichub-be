import { ActorType } from "@app/common";
import { ActorEnum } from "@app/common/enum/actor-type";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export type ResultFileType = 'dicom' | 'pdf';

export enum ResultFileEnum {
  DICOM = 'dicom',
  PDF = 'pdf',
}

@Schema({ discriminatorKey: 'type', timestamps: true }) // `type` determines sub-type
export class LabTestResult {
  @Prop({ type: Types.ObjectId, ref: 'LabOrderItem', required: true, unique: true })
  orderId: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({
    type: {
      userId: String,
      userType: {
        type: String,
        enum: Object.values(ActorEnum),
      },
    },
  })
  createdBy: {
    userId: string;
    userType: ActorType;
  };


  @Prop({
    type: {
      userId: String,
      userType: {
        type: String,
        enum: Object.values(ActorEnum),
      },
    },
  })
  updatedBy: {
    userId: string;
    userType: ActorType;
  };

  @Prop({
    type: [
      {
        url: { type: String, required: true },
        id: String,
        name: String
      },
    ],
  })
  uploadedResult?: {
    url: string;
    id: string;
    name: string;
  }[];

}

export const LabTestResultSchema = SchemaFactory.createForClass(LabTestResult);
