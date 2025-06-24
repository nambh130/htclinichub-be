import { Module } from '@nestjs/common';
import { AnalyzeHealthcareDataController } from './analyze-healthcare-data.controller';
import { AnalyzeHealthcareDataService } from './analyze-healthcare-data.service';

@Module({
  controllers: [AnalyzeHealthcareDataController],
  providers: [AnalyzeHealthcareDataService]
})
export class AnalyzeHealthcareDataModule {}
