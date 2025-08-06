import { InjectModel } from "@nestjs/mongoose";
import { BarcodeConunterType, BarcodeCounter } from "./models/barcode.schema";
import { Model } from "mongoose";

export class BarcodeCounterService {
  constructor(
    @InjectModel(BarcodeCounter.name, 'patientService')
    private readonly barcodeCounter: Model<BarcodeCounter>
  ) {}

  private getCurrentDateCode(): string {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yy}${mm}${dd}`;
  }

  private async getNextSequence(
    name: BarcodeConunterType,
    clinicId: string,
    dateCode: string,
  ): Promise<number> {
    const result = await this.barcodeCounter.findOneAndUpdate(
      { name, clinicId, date: dateCode },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    return result.seq;
  }

  async generateBarcode(
    barcodeName: BarcodeConunterType,
    clinicId: string,
  ): Promise<string> {
    const dateCode = this.getCurrentDateCode();
    const seq = await this.getNextSequence(barcodeName, clinicId, dateCode);

    const paddedSeq = seq.toString().padStart(6, '0');

    return `${dateCode}-${paddedSeq}`; // LO-250805-000001
  }
}
