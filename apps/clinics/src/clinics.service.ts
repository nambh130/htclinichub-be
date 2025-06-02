import { Inject, Injectable } from '@nestjs/common';
import { CLINIC_SERVICE } from '@app/common';
import { ClientKafka } from '@nestjs/microservices';
import { AddClinicDto } from '@app/common/dto/clinic';
import { ClinicRepository } from './clinic.repository';
import { Clinic } from './models';
import { PinoLogger } from 'nestjs-pino';
import { nanoid } from 'nanoid';

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
      newClinic.ownerId = addClinicDto.ownerId;
      newClinic.createdBy = userId;
      newClinic.token = nanoid(32);

      const clinic = await this.clinicsRepository.create(newClinic);

      this.logger.info({
        msg: 'Clinic created successfully',
        type: 'audit-log',
        context: 'ClinicService',
        operation: 'CREATE_CLINIC',
        status: 'SUCCESS',
        clinicId: clinic.id,
        name: clinic.name,
        location: clinic.location,
        ownerId: clinic.ownerId,
        createdBy: userId,
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
        createdBy: clinic.createdBy,
      });

      return clinic;
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
  ): Promise<Clinic[]> {
    const { limit = 20, page = 1 } = options || {};
    const start = Date.now();

    try {
      const clinics = await this.clinicsRepository.findAll({ limit, page });

      const duration = Date.now() - start;

      this.logger.info({
        msg: 'Retrieved clinics successfully',
        type: 'audit-log',
        context: 'ClinicService',
        operation: 'GET_CLINICS',
        status: 'SUCCESS',
        userId,
        durationMs: duration,
        businessData: {
          retriever: {
            userId,
            action: 'GET_CLINICS',
            timestamp: new Date().toISOString(),
          },
        },
      });

      return clinics.data;
    } catch (error) {
      const duration = Date.now() - start;

      this.logger.error({
        msg: 'Failed to retrieve clinics',
        type: 'audit-log',
        context: 'ClinicService',
        operation: 'GET_CLINICS',
        status: 'ERROR',
        userId,
        durationMs: duration,
        error: {
          message: error.message,
          stack: error.stack,
        },
      });

      throw new Error(
        'Không thể lấy danh sách phòng khám, vui lòng thử lại sau',
      );
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
      await this.clinicsRepository.delete({ id: parseInt(clinicId) });

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
}
