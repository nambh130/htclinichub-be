import { Body, Controller, Post } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { ClinicService } from "./clinic.service";
import { Clinic } from "../models/clinic.entity";

@Controller()
export class ClinicEventController {
  constructor(
    private readonly clinicService: ClinicService
  ) { }
  @Post("clinic-created")
  async create(@Body() payload: any) {
    const newClinic = {
      name: payload.name,
      location: payload.location,
    }
    return await this.clinicService.createClinic(newClinic)
  }
}
