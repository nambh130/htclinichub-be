import { Inject, Injectable } from '@nestjs/common';
import { CLINIC_SERVICE } from '@app/common';
import { ClientKafka } from '@nestjs/microservices';
import { AddClinicDto, UpdateClinicDto } from '@app/common/dto/clinic';
import { ClinicRepository } from './clinic.repository';
import { Clinic } from './models';
import { PinoLogger } from 'nestjs-pino';
import { nanoid } from 'nanoid';
import { In } from 'typeorm';

@Injectable()
export class ClinicsService {
  constructor(
    private readonly clinicsRepository: ClinicRepository,
    @Inject(CLINIC_SERVICE)
    private readonly clinicsClient: ClientKafka,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ClinicsService.name);
  }

  async addClinic(addClinicDto: AddClinicDto, userId: string) {
    if (!addClinicDto?.name || !addClinicDto?.location) {
      this.logger.warn({
        msg: 'Missing clinic name or location in AddClinicDto',
        type: 'audit-log',
        context: 'ClinicService',
        operation: 'CREATE_CLINIC',
        status: 'FAILED_VALIDATION',
        payload: addClinicDto,
        userId,
        errorDetails: {
          reason: 'Missing required fields',
          timestamp: new Date().toISOString(),
        },
      });
      throw new Error('Invalid clinic data');
    }

    try {
      const newClinic = new Clinic();
      newClinic.name = addClinicDto.name;
      newClinic.location = addClinicDto.location;
      newClinic.email = addClinicDto.email;
      newClinic.phone = addClinicDto.phone;
      newClinic.ownerId = addClinicDto.ownerId;
      newClinic.token = nanoid(32);
      newClinic.createdById = userId;

      const clinic = await this.clinicsRepository.create(newClinic);

      this.logger.info({
        msg: 'Clinic created successfully',
        type: 'audit-log',
        context: 'ClinicService',
        operation: 'CREATE_CLINIC',
        status: 'SUCCESS',
        payload: addClinicDto,
        businessData: {
          clinicCreated: clinic,
          creator: {
            userId,
            action: 'CREATE_CLINIC',
            timestamp: new Date().toISOString(),
          },
          inputData: addClinicDto,
        },
      });

      this.clinicsClient.emit('clinic-added', {
        id: clinic.id,
        name: clinic.name,
        location: clinic.location,
        ownerId: clinic.ownerId,
        token: clinic.token,
        email: clinic.email,
        phone: clinic.phone,
        createdById: clinic.createdById,
      });

      return JSON.parse(JSON.stringify(clinic));
    } catch (error) {
      this.logger.error({
        msg: 'Failed to create clinic',
        type: 'audit-log',
        context: 'ClinicService',
        operation: 'CREATE_CLINIC',
        status: 'ERROR',
        error: error.message,
        stack: error.stack,
        payload: addClinicDto,
        userId,
        errorDetails: {
          action: 'CREATE_CLINIC',
          userId,
          inputData: addClinicDto,
          timestamp: new Date().toISOString(),
        },
      });
      throw error;
    }
  }

  async getClinics(
    userId: string,
    options?: { limit?: number; page?: number },
  ): Promise<{ data: Clinic[]; total: number; page: number; limit: number }> {
    const { limit = 20, page = 1 } = options || {};

    const [clinics, total] = await this.clinicsRepository.findAndCount(
      {}, // where
      (page - 1) * limit, // skip
      limit, // take
    );

    return {
      data: clinics,
      total,
      page,
      limit,
    };
  }

  async getClinicById(id: string, userId: string): Promise<Clinic> {
    if (!id) {
      this.logger.warn({
        msg: 'Missing clinic ID in getClinicById',
        type: 'audit-log',
        context: 'ClinicService',
        operation: 'GET_CLINIC_BY_ID',
        status: 'FAILED_VALIDATION',
        userId,
        errorDetails: {
          reason: 'Missing clinic ID',
          timestamp: new Date().toISOString(),
        },
      });
      throw new Error('Invalid clinic ID');
    }

    try {
      const clinic = await this.clinicsRepository.findOne({ id: id });

      if (!clinic) {
        this.logger.warn({
          msg: 'Clinic not found',
          type: 'audit-log',
          context: 'ClinicService',
          operation: 'GET_CLINIC_BY_ID',
          status: 'NOT_FOUND',
          clinicId: id,
          userId,
        });
        throw new Error('Clinic not found');
      }

      this.logger.info({
        msg: 'Clinic retrieved successfully',
        type: 'audit-log',
        context: 'ClinicService',
        operation: 'GET_CLINIC_BY_ID',
        status: 'SUCCESS',
        clinicId: clinic.id,
        userId,
      });

      return JSON.parse(JSON.stringify(clinic));
    } catch (error) {
      this.logger.error({
        msg: 'Failed to retrieve clinic',
        type: 'audit-log',
        context: 'ClinicService',
        operation: 'GET_CLINIC_BY_ID',
        status: 'ERROR',
        error: error.message,
        stack: error.stack,
        clinicId: id,
        userId,
      });
      throw error;
    }
  }

  async getClinicByIds(clinicIds: string[]) {
    const clinics = await this.clinicsRepository.find({ id: In(clinicIds) });
    return clinics;
  }

  async updateClinic(
    id: string,
    updateClinicDto: UpdateClinicDto,
    userId: string,
  ): Promise<Clinic> {
    if (!id) {
      this.logger.warn({
        msg: 'Missing clinic ID in updateClinic',
        type: 'audit-log',
        context: 'ClinicService',
        operation: 'UPDATE_CLINIC',
        status: 'FAILED_VALIDATION',
        userId,
        errorDetails: {
          reason: 'Missing clinic ID',
          timestamp: new Date().toISOString(),
        },
      });
      throw new Error('Invalid clinic ID');
    }

    try {
      const clinic = await this.clinicsRepository.findOne({ id: id });
      if (!clinic) {
        this.logger.warn({
          msg: 'Clinic not found for update',
          type: 'audit-log',
          context: 'ClinicService',
          operation: 'UPDATE_CLINIC',
          status: 'NOT_FOUND',
          clinicId: id,
          userId,
        });
        throw new Error('Clinic not found');
      }

      const clinicToUpdate = new Clinic();
      clinicToUpdate.id = id;

      console.log(updateClinicDto)
      const updatedClinic = await this.clinicsRepository.update(
        clinicToUpdate, // conditions to update
        {
          ...clinic,
          ...updateClinicDto,
          ownerId: updateClinicDto.ownerId,
          updatedById: userId,
        }, // data to update
      );

      this.logger.info({
        msg: 'Clinic updated successfully',
        type: 'audit-log',
        context: 'ClinicService',
        operation: 'UPDATE_CLINIC',
        status: 'SUCCESS',
        clinicId: id,
        userId,
      });

      return JSON.parse(JSON.stringify(updatedClinic));
    } catch (error) {
      this.logger.error({
        msg: 'Failed to update clinic',
        type: 'audit-log',
        context: 'ClinicService',
        operation: 'UPDATE_CLINIC',
        status: 'ERROR',
        error: error.message,
        stack: error.stack,
        clinicId: id,
        userId,
      });
      throw new Error('Không thể cập nhật phòng khám, vui lòng thử lại sau');
    }
  }

  async deleteClinic(clinicId: string, userId: string): Promise<void> {
    if (!clinicId) {
      this.logger.warn({
        msg: 'Missing clinic ID in deleteClinic',
        type: 'audit-log',
        context: 'ClinicService',
        operation: 'DELETE_CLINIC',
        status: 'FAILED_VALIDATION',
        userId,
        errorDetails: {
          reason: 'Missing clinic ID',
          timestamp: new Date().toISOString(),
        },
      });
      throw new Error('Invalid clinic ID');
    }

    try {
      await this.clinicsRepository.delete({ id: clinicId });

      this.logger.info({
        msg: 'Clinic deleted successfully',
        type: 'audit-log',
        context: 'ClinicService',
        operation: 'DELETE_CLINIC',
        status: 'SUCCESS',
        clinicId,
        userId,
      });

      this.clinicsClient.emit('clinic-deleted', { id: clinicId });
    } catch (error) {
      this.logger.error({
        msg: 'Failed to delete clinic',
        type: 'audit-log',
        context: 'ClinicService',
        operation: 'DELETE_CLINIC',
        status: 'ERROR',
        error: error.message,
        stack: error.stack,
        userId,
      });
      throw error;
    }
  }

  async getClinicsByIds(clinicIds: string[]) {
    return this.clinicsRepository.findMany({
      id: In(clinicIds),
    });
  }
}
