import { MongoAbstractRepository } from "@app/common";
import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, PipelineStage, Types } from "mongoose";
import { LabOrder } from "../models/lab-order.schema";
import { TestType } from "../../lab-test/models/lab-test.schema";

@Injectable()
export class LabOrderRepository extends MongoAbstractRepository<LabOrder> {
  protected readonly logger = new Logger(LabOrderRepository.name);

  constructor(
    @InjectModel(LabOrder.name, 'patientService')
    readonly labOrderModel: Model<LabOrder>
  ) {
    super(labOrderModel)
  }

  async getOrderItemsByClinic({
    clinicId,
    startDate,
    endDate,
    barcode,
    medicalRecord,
    testType,
    page = 1,
    limit = 10
  }) {
    const matchStage: any = { clinicId };

    if (startDate || endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      matchStage.orderDate = {};
      if (startDate) matchStage.orderDate.$gte = startOfDay;
      if (endDate) matchStage.orderDate.$lte = endOfDay;
    }

    if (medicalRecord) {
      matchStage.medicalRecord = new Types.ObjectId(medicalRecord);
    }

    if (barcode) {
      matchStage.barCode = barcode;
    }

    const skip = (page - 1) * limit;

    const pipeline: PipelineStage[] = [
      { $match: matchStage }, // matchStage is built from clinicId, startDate, endDate, medicalRecord, barcode

      {
        $lookup: {
          from: 'laborderitems',
          localField: 'orderItems',
          foreignField: '_id',
          as: 'items'
        }
      },
      { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: 'labtests',
          localField: 'items.labTest',
          foreignField: '_id',
          as: 'labTest'
        }
      },
      { $unwind: { path: '$labTest', preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: 'medicalrecords',
          localField: 'medicalRecord',
          foreignField: '_id',
          as: 'medicalRecord'
        }
      },
      { $unwind: { path: '$medicalRecord', preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: 'patients',
          localField: 'medicalRecord.patient_id',
          foreignField: '_id',
          as: 'patient'
        }
      },
      { $unwind: { path: '$patient', preserveNullAndEmptyArrays: true } },

      // Optional test type filtering
      ...(testType
        ? [
          {
            $match: {
              'labTest.testType': testType
            }
          }
        ]
        : []),

      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            {
              $replaceRoot: {
                newRoot: {
                  _id: '$items._id',
                  labTest: '$labTest',
                  status: '$items.status',
                  orderDate: '$orderDate',
                  medicalReport: '$medicalRecord._id',
                  labOrderId: '$_id',
                  labOrderBarcode: '$barCode',
                  patient: {
                    _id: '$patient._id',
                    name: '$patient.fullname',
                    dob: '$patient.dOB',
                  }
                }
              }
            },
            { $sort: { orderDate: 1 } },
            { $skip: skip },
            { $limit: limit }
          ]
        }
      }
    ];

    const result = await this.labOrderModel.aggregate(pipeline).exec();
    const total = result[0]?.metadata[0]?.total || 0;
    const data = result[0]?.data || [];
    return { data, total }
  }

}
