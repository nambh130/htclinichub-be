import { BaseClinicService } from "@app/common/modules/clinic/base-clinics.service";
import { Injectable } from "@nestjs/common";
import { ClinicRepository } from "./clinic.repository";
import { Clinic } from "../models/clinic.entity";

@Injectable()
export class ClinicService extends BaseClinicService<Clinic> {
  constructor(
    private readonly clinicRepo: ClinicRepository
  ) { super(clinicRepo) }

  async create(data: any) {
    this.clinicRepo.create(new Clinic({ name: data.name, location: data.location }))
  }
}
