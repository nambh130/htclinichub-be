import { InjectModel } from "@nestjs/mongoose";
import { BarcodeConunterType, BarcodeCounter } from "./models/barcode.schema";
import { Model } from "mongoose";

export class BarcodeCounterService {
  constructor(
    @InjectModel(BarcodeCounter.name, 'patientService')
    readonly barcodeCounter: Model<BarcodeCounter>
  ) { }
  // counter.service.ts or inside labOrder.service.ts
  private async getNextSequence(name: BarcodeConunterType): Promise<number> {
    const result = await this.barcodeCounter.findOneAndUpdate(
      { name },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    return result.seq;
  }

  async generateBarcode(barcodeName: BarcodeConunterType): Promise<string> {
    const nextSeq = await this.getNextSequence(barcodeName);
    return nextSeq.toString().padStart(12, '0');
  }

}
