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
import { LabOrder, LabOrderSchema } from '../lab-order/models/lab-order.schema';
import { LabOrderItem, LabOrderItemSchema } from '../lab-order/models/lab-order-item.schema';
import { LabOrderController } from '../lab-order/lab-order.controller';
import { LabOrderRepository } from '../lab-order/repositories/lab-order.repository';
import { LabOrderService } from '../lab-order/lab-order.service';
import { LabOrderItemRepository } from '../lab-order/repositories/lab-order-item.repository';

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
        },
        {
          name: LabOrder.name,
          schema: LabOrderSchema,
        },
        {
          name: LabOrderItem.name,
          schema: LabOrderItemSchema,
        },
      ],
      'patientService', // connectionName from forRoot
    )
  ],
  controllers: [LabTestController, LabOrderController],
  providers: [LabTestService,
    LabFieldRepository,
    QuantitativeTestRepository,
    LabTestRepository,
    ImagingTestRepository,

    LabOrderRepository,
    LabOrderService,
    LabOrderItemRepository
  ],
  exports: [LabTestRepository, LabTestService]
})
export class LabTestModule { }
