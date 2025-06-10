import { BadRequestException, Body, Controller, Inject, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { LoginDto } from '@app/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersRepository } from './users/users.repository';
import { CreatePatientDto } from './patients/dto/create-patient.dto';
import { PatientsService } from './patients/patients.service';
import { OtpService } from './otp/otp.service';
import { RequestOtpDto } from './otp/dto/request-otp.dto';
import { VerifyOtpDto } from './otp/dto/verify-otp.dto';
import { CreateClinicDto } from './clinics/dto/create-clinic.dto';
import { ClinicUsersService } from './clinic-users/clinic-users.service';
import { ClinicsService } from './clinics/clinics.service';
import { Clinic } from './clinics/models/clinic.entity';
import { ClinicUser } from './clinic-users/models/clinic-user.entity';
import { CreateUserDto } from './clinic-users/dto/create-user.dto';
import { UserCreatedEvent } from '@app/common/events/users/user-created.event';
import { AUTH_SERVICE } from '@app/common';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly clinicService: ClinicsService,
    private readonly userService: ClinicUsersService,
    private readonly patientService: PatientsService,
    private readonly otpService: OtpService,
    @Inject(AUTH_SERVICE)
    private readonly messageBroker: ClientKafka
  ) { }

  @Post('request-otp')
  async requestOtp(@Body() requestOtpDto: RequestOtpDto) {
    return this.otpService.sendOtp(requestOtpDto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const isOtpValid = await this.otpService.verifyOtp(verifyOtpDto);
    if (isOtpValid) {
      const token = await this.authService.patientLogin(verifyOtpDto.phone);
      return { success: true, token };
    }

    throw new UnauthorizedException('Invalid or expired OTP');
  }

  @Post("patient/login")
  async createPatient(@Body() createPatientDto: CreatePatientDto) {
    try {
      console.log("request: ", createPatientDto)
      return await this.patientService.createPatient(createPatientDto);
    } catch (e) {
      if (e.code === '23505') { // Postgres unique violation
        throw new BadRequestException({ message: 'Email already exists' });
      }
      throw e;
    }
  }

  @Post("test-clinic")
  async createClinic(@Body() createClinicDto: CreateClinicDto) {
    return await this.clinicService.createClinic(createClinicDto)
  }

  @Post("test-user")
  async createUser(@Body() createUserDto: CreateUserDto) {
    const newUser = await this.userService.createUser(createUserDto)
    if (newUser) {
      const event = new UserCreatedEvent(
        newUser.id,
        newUser.email,
        newUser.userType
      )
      this.messageBroker.emit("user-created", event);
    }
    return newUser;
  }

  //@MessagePattern('login')
  //async login(userDto: UserDto) {
  //  const token = await this.authService.login(userDto);
  //  const user = (await this.usersRepository.findByEmail(
  //    userDto.email,
  //  )) as UserDocument;
  //  return { user, token };
  //}

  @UseGuards(JwtAuthGuard)
  @MessagePattern('authenticate')
  authenticate(@Payload() data: any) {
    console.log(data);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return data.user;
  }
}
