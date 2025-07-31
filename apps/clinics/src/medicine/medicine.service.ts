import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Readable } from 'stream';
import csvParser from 'csv-parser';
import { BaseService } from '@app/common';
import { MedicineRepository } from './medicine.repository';
import { ImportMedicineDto, UpdateMedicineDto } from '@app/common/dto/staffs/medicine';
import { plainToInstance } from 'class-transformer';
import stripBomStream from 'strip-bom-stream';
import { ClinicRepository } from '../clinic.repository';
import { Brackets } from 'typeorm';
import { Medicine } from '@clinics/models';
@Injectable()
export class MedicineService extends BaseService {
  constructor(
    private readonly medicineRepository: MedicineRepository,
    private readonly clinicRepository: ClinicRepository,

  ) {
    super();
  }

  async importCsv(
    file: Express.Multer.File,
    clinicId: string,
  ) {
    // ✅ 1. Validate
    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      throw new BadRequestException('Only .csv files are allowed');
    }

    if (file.mimetype !== 'text/csv') {
      throw new BadRequestException('Invalid file type. Must be text/csv');
    }

    const rows: ImportMedicineDto[] = [];

    // ✅ 2. Read from buffer stream
    const readable = Readable.from(file.buffer);

    return new Promise((resolve, reject) => {
      readable
        .pipe(stripBomStream()) // 👈 BỎ BOM
        .pipe(csvParser({ separator: ';' }))
        .on('data', (row) => {
          console.log(row);
          const dto = plainToInstance(ImportMedicineDto, {
            code: row['code'],
            name: row['name'],
            concentration: row['concentration'],
            ingredient: row['ingredient'],
            unit: row['unit'],
            quantity: parseInt(row['quantity'], 10) || 0,
            timesPerDay: parseInt(row['timesPerDay'], 10) || 0,
            dosePerTime: row['dosePerTime'],
            schedule: row['schedule'],
            madeIn: row['madeIn'],
            category: row['category'],

          });
          rows.push(dto);
        })
        .on('end', async () => {
          try {
            const savedList: Medicine[] = [];

            for (const dto of rows) {
              // Check if medicine with the same code already exists in the clinic
              const existing = await this.medicineRepository.findOne({
                code: dto.code,
                clinic_id: { id: clinicId },
              }
              );

              if (existing) {
                // Update existing medicine
                Object.assign(existing, dto);
                const updated = await this.medicineRepository.update(existing, dto);
                savedList.push(updated);
              } else {
                // Create new medicine
                const newMedicine = new Medicine();
                Object.assign(newMedicine, dto);
                newMedicine.clinic_id = { id: clinicId } as any;

                const saved = await this.medicineRepository.create(newMedicine);
                savedList.push(saved);
              }
            }

            resolve({
              message: 'CSV imported successfully',
              count: savedList.length,
            });
          } catch (err) {
            reject({
              message: 'Error saving data to database',
              error: err.message,
            });
          }
        })
        .on('error', (err) => {
          reject({
            message: 'Error reading CSV file',
            error: err.message,
          });
        });
    });
  }

  async createMedicine(
    clinicId: string,
    dto: ImportMedicineDto,
  ) {
    const clinic = await this.clinicRepository.findOne({ id: clinicId });
    if (!clinic) {
      throw new NotFoundException('Doctor not found');
    }

    const existing = await this.medicineRepository.findOne({
      code: dto.code,
      clinic_id: { id: clinicId }
    });

    if (existing) {
      throw new BadRequestException(`Mã thuốc "${dto.code}" đã tồn tại trong phòng khám.`);
    }

    const medicine = new Medicine();
    medicine.clinic_id = clinic;
    medicine.code = dto.code;
    medicine.name = dto.name;
    medicine.concentration = dto.concentration;
    medicine.ingredient = dto.ingredient;
    medicine.unit = dto.unit;
    medicine.quantity = dto.quantity;
    medicine.timesPerDay = dto.timesPerDay;
    medicine.dosePerTime = dto.dosePerTime;
    medicine.madeIn = dto.madeIn;
    medicine.category = dto.category;
    medicine.schedule = dto.schedule;
    medicine.createdById = clinicId;
    medicine.status = 'DANG_SU_DUNG';
    const result = await this.medicineRepository.create(medicine);

    return {
      id: result.id,
      code: result.code,
      name: result.name,
      concentration: result.concentration,
      ingredient: result.ingredient,
      unit: result.unit,
      quantity: result.quantity,
      timesPerDay: result.timesPerDay,
      dosePerTime: result.dosePerTime,
      madeIn: result.madeIn,
      category: result.category,
      schedule: result.schedule,
      clinicId: result.clinic_id?.id ?? null,
      clinicName: result.clinic_id?.name ?? null
    };
  }

  async getMedicineClinicId(
    clinicId: string,
  ) {
    const clinic = await this.clinicRepository.findOne({ id: clinicId });
    if (!clinic) {
      throw new NotFoundException('Doctor not found');
    }

    const result = await this.medicineRepository.find({
      clinic_id: {
        id: clinicId,
      },
    });

    const data = {
      clinicId: clinic.id,
      clinicName: clinic.name,
      medicines: result.map((medicine) => ({
        id: medicine.id,
        code: medicine.code,
        name: medicine.name,
        concentration: medicine.concentration,
        ingredient: medicine.ingredient,
        unit: medicine.unit,
        quantity: medicine.quantity,
        timesPerDay: medicine.timesPerDay,
        dosePerTime: medicine.dosePerTime,
        madeIn: medicine.madeIn,
        category: medicine.category,
        schedule: medicine.schedule,
        status: medicine.status,
        createdAt: medicine.createdAt
      })),
    };

    return data;
  }

  async searchMedicine(clinicId: string, search: string) {
    const clinic = await this.clinicRepository.findOne({ id: clinicId });
    if (!clinic) {
      throw new NotFoundException('Doctor not found');
    }

    const query = this.medicineRepository.createQueryBuilder('medicine')
      .leftJoinAndSelect('medicine.clinic_id', 'clinic')
      .where('clinic.id = :clinicId', { clinicId });

    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('medicine.code ILIKE :keyword', { keyword: `%${search}%` })
            .orWhere('medicine.name ILIKE :keyword', { keyword: `%${search}%` })
            .orWhere('medicine.ingredient ILIKE :keyword', { keyword: `%${search}%` });
        }),
      );
    }

    query.orderBy('medicine.name', 'ASC');

    const result = await query.getMany();

    return {
      clinicId: clinic.id,
      clinicName: clinic.name,
      medicines: result.map((medicine) => ({
        id: medicine.id,
        code: medicine.code,
        name: medicine.name,
        concentration: medicine.concentration,
        ingredient: medicine.ingredient,
        unit: medicine.unit,
        quantity: medicine.quantity,
        timesPerDay: medicine.timesPerDay,
        dosePerTime: medicine.dosePerTime,
        madeIn: medicine.madeIn,
        category: medicine.category,
        schedule: medicine.schedule,
        status: medicine.status,
        createdAt: medicine.createdAt
      })),
    };
  }

  async medicineInfo(
    clinicId: string,
    medicineInfo: string
  ) {
    const clinic = await this.clinicRepository.findOne({ id: clinicId });
    if (!clinic) {
      throw new NotFoundException('Doctor not found');
    }

    const result = await this.medicineRepository.findOne({
      id: medicineInfo,
    });

    return {
      clinicId: clinic.id,
      clinicName: clinic.name,
      id: result.id,
      code: result.code,
      name: result.name,
      concentration: result.concentration,
      ingredient: result.ingredient,
      unit: result.unit,
      quantity: result.quantity,
      timesPerDay: result.timesPerDay,
      dosePerTime: result.dosePerTime,
      madeIn: result.madeIn,
      category: result.category,
      schedule: result.schedule,
      status: result.status,
      createdAt: result.createdAt
    };
  }

  async medicineUpdate(
    clinicId: string,
    medicineId: string,
    dto: UpdateMedicineDto,
  ) {
    const clinic = await this.clinicRepository.findOne({ id: clinicId });
    if (!clinic) {
      throw new NotFoundException('Phòng khám không tồn tại');
    }

    const where = {
      id: medicineId,
      clinic_id: { id: clinicId },
    };

    // 3. Cập nhật thuốc sử dụng hàm `findOneAndUpdate` tái sử dụng
    const updated = await this.medicineRepository.findOneAndUpdate(where, dto);

    // 4. Trả về dữ liệu đã cập nhật
    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      concentration: updated.concentration,
      ingredient: updated.ingredient,
      unit: updated.unit,
      quantity: updated.quantity,
      timesPerDay: updated.timesPerDay,
      dosePerTime: updated.dosePerTime,
      schedule: updated.schedule,
      category: updated.category,
      madeIn: updated.madeIn,
      status: updated.status,
      clinicId: clinic.id,
      clinicName: clinic.name,
    };
  }

  async exportMedicineDataToCSV(clinicId: string) {
    const clinic = await this.clinicRepository.findOne({ id: clinicId });

    const result = await this.medicineRepository.find({
      clinic_id: {
        id: clinicId,
      },
    });
    if (!result.length) {
      return {
        csv: 'No data found',
        clinicName: clinic?.name || 'clinic',
      };
    }

    if (!result.length) {
      return {
        csv: '\uFEFFNo data found',
        clinicName: clinic?.name || 'clinic',
      };
    }

    const header = 'id;code;name;concentration;ingredient;unit;quantity;timesPerDay;dosePerTime;madeIn;category;schedule;status\n';

    const rows = result.map(m =>
      `${m.id};${m.code};${m.name};${m.concentration};${m.ingredient};${m.unit};${m.quantity};${m.timesPerDay};${m.dosePerTime};${m.madeIn};${m.category};${m.schedule};${m.status}`
    ).join('\n');

    const bom = '\uFEFF'; // ✅ BOM để Excel hiểu UTF-8
    return {
      csv: bom + header + rows,
      clinicName: clinic?.name || 'clinic',
    };
  }

  async getMedicineByCategory(clinicId: string, category: string) {
    const clinic = await this.clinicRepository.findOne({ id: clinicId });
    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    const result = await this.medicineRepository.find({
      category: category
    });

    return {
      clinicId: clinic.id,
      clinicName: clinic.name,
      medicines: result.map((medicine) => ({
        id: medicine.id,
        code: medicine.code,
        name: medicine.name,
        concentration: medicine.concentration,
        ingredient: medicine.ingredient,
        unit: medicine.unit,
        quantity: medicine.quantity,
        timesPerDay: medicine.timesPerDay,
        dosePerTime: medicine.dosePerTime,
        madeIn: medicine.madeIn,
        category: medicine.category,
        schedule: medicine.schedule,
        status: medicine.status,
        createdAt: medicine.createdAt
      })),
    };
  }


}
