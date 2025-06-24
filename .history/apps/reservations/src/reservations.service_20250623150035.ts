import { Inject, Injectable } from '@nestjs/common';
import {
  CreateReservationDto,
  ReservationCreatedEvent,
  RESERVATIONS_SERVICE,
} from '@app/common';
import { ReservationsRepository } from './reservations.repository';
import { ClientKafka } from '@nestjs/microservices';
import { ReservationsPostgresRepository } from './reservations.postgres.repository';
import { Reservation } from './models/reservation.entity';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
    private readonly reservationsPostgresRepository: ReservationsPostgresRepository,
    @Inject(RESERVATIONS_SERVICE)
    private readonly reservationsClient: ClientKafka,
  ) {}

  async createReservation(
    createReservationDto: CreateReservationDto,
    userId: string,
  ) {
    const reservation = await this.reservationsRepository.create({
      ...createReservationDto,
      userId,
      timestamp: new Date(),
    });

    const event = new ReservationCreatedEvent(
      reservation._id.toString(),
      reservation.timestamp,
      reservation.userId,
      reservation.placeId,
    );

    this.reservationsClient.emit('reservation-created', event);

    return reservation;
  }

  async createPatient(createPatientDto: CreatePatientDto, userId: string) {
  // Check if phone number already exists
  const existedPhone = await this.patientsRepository.findByPhone(createPatientDto.phone);
  if (existedPhone) {
    throw new BadRequestException('Số điện thoại đã tồn tại!');
  }

  // Create plain object for new patient
  const newPatient = {
    ...createPatientDto,
    address2: createPatientDto.address2 ?? '',
    createdBy: userId,
    medical_history: {
      allergies: createPatientDto.medical_history.allergies,
      personal_history: createPatientDto.medical_history.personal_history,
      family_history: createPatientDto.medical_history.family_history,
    },
  };

  try {
    const patient = await this.patientsRepository.create(newPatient);

    // Emit Kafka event if needed
    // const event = new PatientCreatedEvent(...);
    // this.patientsClient.emit('patient-created', event);

    return patient;
  } catch (error) {
    console.error('Error saving patient:', error);
    throw error;
  }
}


  async createReservationPostgres(
    createReservationDto: CreateReservationDto,
    userId: string,
  ) {
    const reservation = new Reservation();
    reservation.timestamp = new Date();
    reservation.userId = userId;
    reservation.placeId = createReservationDto.placeId;

    return this.reservationsPostgresRepository.create(reservation);
  }
}
