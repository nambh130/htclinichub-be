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
import {
  CurrentUser,
  JwtAuthGuard,
  TokenPayload,
  UserDocument,
} from '@app/common';
import {
  AddClinicDto,
  ClinicDto,
  UpdateClinicDto,
} from '@app/common/dto/clinic';

@Controller('clinic')
export class ClinicController {
  constructor(private readonly clinicService: ClinicService) {}

  @Post('')
  @UseGuards(JwtAuthGuard)
  async addClinic(
    @Body() addClinicDto: AddClinicDto,
    @CurrentUser() user: TokenPayload,
  ) {
    console.log(user);
    return this.clinicService.addClinic(addClinicDto, user.userId);
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  async getClinics(
    @CurrentUser() user: TokenPayload,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    return this.clinicService.getClinics(user.userId, {
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
}
