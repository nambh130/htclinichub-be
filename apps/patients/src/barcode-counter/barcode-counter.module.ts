import { MongoDatabaseModule } from "@app/common";
import { Module } from "@nestjs/common";
import { BarcodeCounter, BarcodeCounterSchema } from "./models/barcode.schema";
import { BarcodeCounterService } from "./barcode-counter.service";

@Module({
  imports: [
    MongoDatabaseModule.forFeature(
      [
        {
          name: BarcodeCounter.name,
          schema: BarcodeCounterSchema
        },
      ],
      'patientService', // connectionName from forRoot
    )
  ],
  providers: [BarcodeCounterService],
  exports: [BarcodeCounterService],
})
export class BarcodeCounterModule { }
