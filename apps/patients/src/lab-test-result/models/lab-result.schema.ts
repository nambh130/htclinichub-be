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
  testOrder: Types.ObjectId;

  @Prop({ default: Date.now })
  completedAt: Date;

  @Prop()
  takenDate: string;

  @Prop({
    type: {
      doctorId: String,
      doctorName: String,
    },
  })
  takenBy: {
    doctorId: string;
    doctorName: string;
  };

  @Prop({
    type: {
      url: { type: String, required: true },
      fileType: {
        type: String,
        enum: Object.values(ResultFileEnum),
        required: true,
      },
    },
  })
  uploadedResult?: {
    url: string;
    fileType: ResultFileType;
  };

}

export const LabTestResultSchema = SchemaFactory.createForClass(LabTestResult);
