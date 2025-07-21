import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { PrescriptionService } from "./prescription_detail.service";
import { CreatePrescriptionDto } from "@app/common";

@Controller('prescription')
export class PrescriptionController {
    constructor(
        private readonly prescriptionService: PrescriptionService,
    ) { }

    @Get('get-prescriptions-by-mRId/:mRId')
    async getPrescriptionsByMRId(
        @Param('mRId') mRId: string) {
        try {
            const result =
                await this.prescriptionService.getPrescriptionsByMRId(mRId);
            return result;
        } catch (error) {
            console.error('Error deleting patient:', error);
            throw error;
        }
    }

    @Post('create-prescription-by-mRId/:mRId')
    async createPrescription(
        @Param('mRId') mRId: string,
        @Body('createPrescriptionDto') createPrescriptionDto: CreatePrescriptionDto,
        @Body('user') user: string
    ) {
        try {
            const result = await this.prescriptionService.createPrescription(
                mRId,
                createPrescriptionDto,
                user
            );
            return result;
        } catch (error) {
            console.error('Error creating prescription:', error);
            throw error;
        }
    }
}