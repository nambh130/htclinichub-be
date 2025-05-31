import { Controller, Post, UseGuards, Body, Res } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import {
  CreateReservationDto,
  CurrentUser,
  JwtAuthGuard,
  Roles,
  UserDocument,
  UserDto,
} from '@app/common';
import { Response } from 'express';
import { AddClinicDto, ClinicDto } from '@app/common/dto/clinic';

@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Post('login')
  async login(
    @Body() userDto: UserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, token } = (await this.apiGatewayService.login(userDto)) as {
      user: UserDocument;
      token: string;
    };
    response.cookie('Authentication', token, { httpOnly: true });
    return { user, token };
  }

  @Post('create-user')
  async createUser(@Body() userDto: UserDto) {
    return this.apiGatewayService.createUser(userDto);
  }

  @Post('create-reservation')
  @UseGuards(JwtAuthGuard)
  createReservation(
    @Body() createReservationDto: CreateReservationDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.apiGatewayService.createReservation(
      createReservationDto,
      user._id.toString(),
    );
  }

  @Post('create-reservation-postgres')
  @UseGuards(JwtAuthGuard)
  createReservationPostgres(
    @Body() createReservationDto: CreateReservationDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.apiGatewayService.createReservationPostgres(
      createReservationDto,
      user._id.toString(),
    );
  }

  @Post('add-clinic')
  @UseGuards(JwtAuthGuard)
  async addClinic(
    @Body() addClinicDto: AddClinicDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.apiGatewayService.addClinic(addClinicDto, user._id.toString());
  }
}
