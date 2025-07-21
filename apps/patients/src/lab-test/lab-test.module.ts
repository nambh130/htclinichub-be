import { MongoDatabaseModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ImagingTest, ImagingTestSchema, LabTest, LabTestSchema, QuantitativeTest, QuantitativeTestSchema, TestEnum } from './models/lab-test.schema';
import { ImagingTemplate, ImagingTemplateSchema } from './models/imaging-template.schema';
import { LabTestController } from './lab-test.controller';
import { LabTestService } from './lab-test.services';
import { LabFieldRepository } from './repositories/quantiative-template.repository';
import { LabField, LabFieldSchema } from './models/lab-field.schema';
import { QuantitativeTestRepository } from './repositories/quantiative-test.repository';
import { LabTestRepository } from './repositories/lab-test.repoository';
import { ImagingTestRepository } from './repositories/imaging-test.repository';

@Module({
  imports: [
    MongoDatabaseModule.forFeature(
      [
        {
          name: LabTest.name,
          schema: LabTestSchema,
          discriminators: [
            {
              name: QuantitativeTest.name,
              schema: QuantitativeTestSchema,
              value: TestEnum.LAB,
            },
            {
              name: ImagingTest.name,
              schema: ImagingTestSchema,
              value: TestEnum.IMAGE,
            }
          ]
        },
        {
          name: ImagingTemplate.name,
          schema: ImagingTemplateSchema
        },
        {
          name: LabField.name,
          schema: LabFieldSchema
        }
      ],

      'patientService', // connectionName from forRoot
    )

  ],
  controllers: [LabTestController],
  providers: [LabTestService,
    LabFieldRepository,
    QuantitativeTestRepository,
    LabTestRepository,
    ImagingTestRepository
  ]
})
export class LabTestModule { }
