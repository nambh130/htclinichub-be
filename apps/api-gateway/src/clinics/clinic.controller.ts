import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { ClinicService } from './clinic.service';
import { CurrentUser, JwtAuthGuard, TokenPayload } from '@app/common';
import {
  AddClinicDto,
  ClinicDto,
  CreateClinicScheduleRuleDto,
  UpdateClinicDto,
  UpdateClinicScheduleRuleDto,
} from '@app/common/dto/clinic';
import { ClinicScheduleRuleApiService } from './clinic-schedule-rule/clinic-schedule-rule.service';

@Controller('clinic')
export class ClinicController {
  constructor(
    private readonly clinicService: ClinicService,
    private readonly clinicScheduleRuleApiService: ClinicScheduleRuleApiService,
  ) {}

  @Post('')
  @UseGuards(JwtAuthGuard)
  async addClinic(
    @Body() addClinicDto: AddClinicDto,
    @CurrentUser() user: TokenPayload,
  ) {
    console.log(user);
    return this.clinicService.addClinic(addClinicDto, user.userId);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  async getAllClinics() {
    return await this.clinicService.getAllClinics();
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  async getClinics(
    @CurrentUser() user: TokenPayload,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    return await this.clinicService.getClinics(user.userId, {
      limit: Number(limit),
      page: Number(page),
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getClinicById(
    @CurrentUser() user: TokenPayload,
    @Param('id') id: string,
  ): Promise<ClinicDto> {
    return this.clinicService.getClinicById(id, user.userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateClinic(
    @CurrentUser() user: TokenPayload,
    @Param('id') id: string,
    @Body() updateClinicDto: UpdateClinicDto,
  ): Promise<ClinicDto> {
    return this.clinicService.updateClinic(id, updateClinicDto, user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteClinic(
    @CurrentUser() user: TokenPayload,
    @Param('id') id: string,
  ) {
    return this.clinicService.deleteClinic(id, user.userId);
  }

  @Get(':id/staff-list')
  @UseGuards(JwtAuthGuard)
  async getClinicStaff(
    @Param('id') clinicId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('type') type?: 'doctor' | 'employee' | 'all',
    @Query('search') search?: string,
    @Query('searchBy') searchBy: 'all' | 'name' | 'email' | 'phone' = 'all',
  ) {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit);
    if (offset) queryParams.append('offset', offset);
    if (type) queryParams.append('type', type);
    if (search) queryParams.append('search', search);
    if (searchBy) queryParams.append('searchBy', searchBy);

    return this.clinicService.getClinicStaff(clinicId, queryParams.toString());
  }

  @Get('/get-schedule-rule/:clinicId')
  @UseGuards(JwtAuthGuard)
  async getClinicScheduleRuleByClinicId(
    @CurrentUser() user: TokenPayload,
    @Param('clinicId') clinicId: string,
  ) {
    try {
      const result =
        await this.clinicScheduleRuleApiService.getClinicScheduleRuleByClinicId(
          clinicId,
          user.userId,
        );
      return result;
    } catch (error) {
      console.error('Error fetching clinic schedule rule:', error);
      throw error;
    }
  }

  @Post('/create-schedule-rule/:clinicId')
  @UseGuards(JwtAuthGuard)
  async createClinicScheduleRuleByClinicId(
    @Param('clinicId') clinicId: string,
    @Body() dto: CreateClinicScheduleRuleDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    try {
      const result =
        await this.clinicScheduleRuleApiService.createClinicScheduleRuleByClinicId(
          clinicId,
          dto,
          currentUser,
        );
      return result;
    } catch (error) {
      console.error('Error fetching clinic schedule rule:', error);
      throw error;
    }
  }

  @Put('/update-schedule-rule/:clinicId')
  @UseGuards(JwtAuthGuard)
  async updateClinicScheduleRuleByClinicId(
    @Param('clinicId') clinicId: string,
    @Body() dto: UpdateClinicScheduleRuleDto,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    try {
      const result =
        await this.clinicScheduleRuleApiService.updateClinicScheduleRuleByClinicId(
          clinicId,
          dto,
          currentUser,
        );
      return result;
    } catch (error) {
      console.error('Error fetching clinic schedule rule:', error);
      throw error;
    }
  }
}
