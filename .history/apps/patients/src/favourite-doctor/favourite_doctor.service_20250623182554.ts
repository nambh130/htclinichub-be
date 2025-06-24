import { Inject, Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { AUTH_SERVICE, FavouriteDoctorDto, PATIENTS_TO_STAFF_SERVICE } from '@app/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { FavouriteDoctorRepository } from './favourite_doctor.repository';
import { FavouriteDoctor } from '../models/favourite_doctor.entity';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FavouriteDoctorService implements OnModuleInit {
    constructor(
        private readonly favouriteDoctorRepository: FavouriteDoctorRepository,
        @Inject(PATIENTS_TO_STAFF_SERVICE)
        private readonly doctorClient: ClientKafka,
        // @Inject(AUTH_SERVICE)
        // private readonly authClient: ClientKafka,
    ) { }

     async onModuleInit() {
        try {
            // Important: Subscribe before any send operations
            this.doctorClient.subscribeToResponseOf('get-doctors-by-ids');
            this.doctorClient.subscribeToResponseOf('get-doctors-by-ids.reply');
            await this.doctorClient.connect();
            console.log('Successfully connected to Kafka and subscribed to topics');
        } catch (error) {
            console.error('Failed to initialize Kafka connection:', error);
            throw error;
        }
    }

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
            newDoctor.patient_id = parseInt(userId);

            const patient = await this.favouriteDoctorRepository.create(newDoctor);
            return patient
        } catch (error) {
            console.error('Error adding favorite doctor:', error);
            throw error;
        }
    }

    // @MessagePattern('get-favourite-doctors-list')
   async getFavouriteDoctorsList(data: { userId: string }) {
        try {
            const favs = await this.favouriteDoctorRepository.find({ 
                patient_id: parseInt(data.userId) 
            });
            const doctorIds = favs.map(f => f.doctor_id);
            console.log('Sending request with doctor IDs:', doctorIds);
            
            return await firstValueFrom(
                this.doctorClient.send('get-doctors-by-ids', { ids: doctorIds })
            );
        } catch (error) {
            console.error('Error in getFavouriteDoctorsList:', error);
            throw error;
        }
    }


}
