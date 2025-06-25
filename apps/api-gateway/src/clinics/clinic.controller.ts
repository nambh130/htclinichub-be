  import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Delete,
    Put,
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
    async getClinics(@CurrentUser() user: UserDocument) {
      return this.clinicService.getClinics(user._id.toString());
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getClinicById(
      @CurrentUser() user: UserDocument,
      @Param('id') id: string,
    ): Promise<ClinicDto> {
      return this.clinicService.getClinicById(id, user._id.toString());
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async updateClinic(
      @CurrentUser() user: UserDocument,
      @Param('id') id: string,
      @Body() updateClinicDto: UpdateClinicDto,
    ): Promise<ClinicDto> {
      return this.clinicService.updateClinic(
        id,
        updateClinicDto,
        user._id.toString(),
      );
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async deleteClinic(
      @CurrentUser() user: UserDocument,
      @Param('id') id: string,
    ) {
      return this.clinicService.deleteClinic(id, user._id.toString());
    }
  }
