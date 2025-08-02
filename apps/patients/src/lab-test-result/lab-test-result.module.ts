import { MongoDatabaseModule } from '@app/common';
import { Module } from '@nestjs/common';
import { LabTestResult, LabTestResultSchema } from './models/lab-result.schema';
import { QuantitativeTestResult, QuantitativeTestResultSchema } from './models/quantitative-lab-result.schema';
import { TestEnum } from '../lab-test/models/lab-test.schema';
import { ImagingTestResult, ImagingTestResultSchema } from './models/imaging-test-result.schema';
import { ImagingResultRepository } from './repositories/imaging-test-result.repository';
import { QuantitativeResultRepository } from './repositories/quantitative-test-result.repository';
import { TestResultService } from './lab-test-result.service';

@Module({
  imports: [
    MongoDatabaseModule.forFeature(
      [
        {
          name: LabTestResult.name,
          schema: LabTestResultSchema,
          discriminators: [
            {
              name: QuantitativeTestResult.name,
              schema: QuantitativeTestResultSchema,
              value: TestEnum.LAB,
            },
            {
              name: ImagingTestResult.name,
              schema: ImagingTestResultSchema,
              value: TestEnum.IMAGE,
            }
          ]
        },
      ],
      'patientService', // connectionName from forRoot
    )

  ],
  controllers: [],
  providers: [ImagingResultRepository, QuantitativeResultRepository, TestResultService],
  exports: [ImagingResultRepository, QuantitativeResultRepository, TestResultService]
})
export class LabTestResultModule { }
