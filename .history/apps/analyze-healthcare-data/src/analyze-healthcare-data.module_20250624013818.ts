import { Module } from '@nestjs/common';
import { AnalyzeHealthcareDataController } from './analyze-healthcare-data.controller';


@Module({
  controllers: [AnalyzeHealthcareDataController],
  providers: [AnalyzeHealthcareDataService]
})
export class AnalyzeHealthcareDataModule {}
