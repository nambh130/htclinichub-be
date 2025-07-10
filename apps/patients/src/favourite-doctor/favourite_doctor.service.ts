import { Inject, Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { AUTH_SERVICE, FavouriteDoctorDto, PATIENTS_TO_STAFF_SERVICE } from '@app/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { FavouriteDoctorRepository } from './favourite_doctor.repository';
import { FavouriteDoctor } from '../models/favourite_doctor.entity';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class FavouriteDoctorService {
    constructor(
        private readonly favouriteDoctorRepository: FavouriteDoctorRepository,
        @Inject(PATIENTS_TO_STAFF_SERVICE)
        private readonly httpService: HttpService
    ) { }

    async addFavouriteDoctor(
        userId: string,
        favouriteDoctorDto: FavouriteDoctorDto
    ) {
        try {
            const existedDoctor = await this.favouriteDoctorRepository.checkExistedDoctor({
                patient_id: userId,
                doctor_id: favouriteDoctorDto.doctor_id,
            });

            if (existedDoctor) {
                throw new BadRequestException('Bác sĩ đã tồn tại trong danh sách yêu thích!!!');
            }

            const newDoctor = new FavouriteDoctor();
            newDoctor.doctor_id = favouriteDoctorDto.doctor_id;
            newDoctor.patient_id = userId;

            const patient = await this.favouriteDoctorRepository.create(newDoctor);
            return patient
        } catch (error) {
            console.error('Error adding favorite doctor:', error);
            throw error;
        }
    }

    // @MessagePattern('get-favourite-doctors-list')
    async getFavouriteDoctorsList(userId: string) {
        try {
            const favs = await this.favouriteDoctorRepository.find({
                patient_id: userId,
            });

            const doctorIds = favs.map((f) => f.doctor_id);

            console.log('Doctor IDs:', doctorIds);

            return {
                doctorIds,
                total: doctorIds.length
            };
        } catch (error) {
            console.error('Error in getFavouriteDoctorsList:', error);
            throw error;
        }
    }
}
