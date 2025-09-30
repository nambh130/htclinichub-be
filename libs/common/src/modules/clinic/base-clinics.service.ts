import { Injectable } from '@nestjs/common';
import { BaseClinicRepository } from './base-clinics.repository';
import { BaseClinic } from './models/base-clinic.entity';
import { FindOptionsWhere } from 'typeorm';

@Injectable()
export class BaseClinicService<T extends BaseClinic> {
  constructor(private readonly baseClinicRepo: BaseClinicRepository<T>) {}

  async getAllClinics(): Promise<any> {
    return this.baseClinicRepo.findAll();
  }

  async getClinicById(id: string): Promise<T | null> {
    return this.baseClinicRepo.findOne({ id } as FindOptionsWhere<T>);
  }

  async createClinic(data: any): Promise<T> {
    console.log(data);
    const clinic = Object.assign({}, data) as T;
    console.log(clinic);
    return await this.baseClinicRepo.create(clinic);
  }

  //async updateClinic(id: string, data: Partial<Clinic>): Promise<Clinic> {
  //  return this.baseClinicRepo.findOneAndUpdate({ id }, data);
  //}

  //async deleteClinic(id: string): Promise<void> {
  //  await this.baseClinicRepo.findOneAndDelete({ id });
  //}

  //async getClinicsWithCount(skip = 0, take = 10): Promise<[Clinic[], number]> {
  //  return this.baseClinicRepo.findAndCount({}, skip, take);
  //}
}
