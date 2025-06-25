import {
    AUTH_SERVICE,
    STAFF_SERVICE,
} from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ManageDoctorScheduleService implements OnModuleInit {
    constructor(
        @Inject(STAFF_SERVICE) private readonly staffClient: ClientKafka,
        @Inject(AUTH_SERVICE)
        private readonly authClient: ClientKafka,
    ) { }


    async onModuleInit() {
        this.staffClient.subscribeToResponseOf('doctor-view-working-shift');
        this.staffClient.subscribeToResponseOf('detail-working-shift');

        this.authClient.subscribeToResponseOf('authenticate');

        await this.staffClient.connect();
        await this.authClient.connect();
    }

    async getViewWorkingShiftService(
        doctorId: string,
        userId: string,
    ) {
        try {
            const result = await firstValueFrom(
                this.staffClient.send('doctor-view-working-shift', { doctorId, userId })
            );
            return result;
        } catch (error) {
            console.error('Error retrieving patient:', error);
            throw error;
        }
    }

    async getDetailShift(
        shiftId: string,
        userId: string,
    ) {
        try {
            const result = await firstValueFrom(
                this.staffClient.send('detail-working-shift', { doctorId, userId })
            );
            return result;
        } catch (error) {
            console.error('Error retrieving patient:', error);
            throw error;
        }
    }
}