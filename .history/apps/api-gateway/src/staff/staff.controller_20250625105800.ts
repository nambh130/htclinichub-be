import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateDoctorAccountDto, JwtAuthGuard } from '@app/common';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  createDoctorAccount(@Body() dto: CreateDoctorAccountDto) {
    return this.staffService.create(dto);
  }

  @Get()
  findAll() {
    return this.staffService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(+id);
  }

  // View Working Hours
  // Set Up Working Hours
  // Change Working Hours

  @Get('/doctor/view-working Hours/:id')
  // @UseGuards(JwtAuthGuard)
  async getPatientById(
    @Param('id') id: string,
    // @CurrentUser() user: UserDocument,
  ) {
    try {
      const patient = await this.patientService.getPatientById(id, "1");
      return patient;
    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw error;
    }
  }
}
