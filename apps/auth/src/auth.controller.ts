import { BadRequestException, Body, Controller, Get, Inject, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreatePatientDto } from './patients/dto/create-patient.dto';
import { PatientsService } from './patients/patients.service';
import { OtpService } from './otp/otp.service';
import { RequestOtpDto } from './otp/dto/request-otp.dto';
import { VerifyOtpDto } from './otp/dto/verify-otp.dto';
import { CreateClinicDto } from './clinics/dto/create-clinic.dto';
import { ClinicUsersService } from './clinic-users/clinic-users.service';
import { ClinicsService } from './clinics/clinics.service';
import { CreateUserDto } from './clinic-users/dto/create-user.dto';
import { UserCreatedEvent } from '@app/common/events/users/user-created.event';
import { AUTH_SERVICE } from '@app/common';
import { InvitationCheckDto } from './dto/invitation-check.dto';
import { InvitationsService } from './invitations/invitations.service';
import { InvitationSignupDto } from './dto/invitation-signup.dto';
import { ClinicUserLoginDto } from './dto/clinic-user-login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly clinicService: ClinicsService,
    private readonly userService: ClinicUsersService,
    private readonly otpService: OtpService,
    private readonly invitationService: InvitationsService,
    @Inject(AUTH_SERVICE)
    private readonly messageBroker: ClientKafka
  ) { }

  //Patient request an otp to login
  @Post('request-otp')
  async requestOtp(@Body() requestOtpDto: RequestOtpDto) {
    return this.otpService.sendOtp(requestOtpDto);
  }

  //Patient login (or signup) with otp
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const isOtpValid = await this.otpService.verifyOtp(verifyOtpDto);
    if (isOtpValid) {
      const token = await this.authService.patientLogin(verifyOtpDto.phone);
      return { success: true, token };
    }

    throw new UnauthorizedException('Invalid or expired OTP');
  }

  // Check if the email in the invitation already has an account
  @Post("invitation-check")
  async checkInvitation(@Body() invitationCheckDto: InvitationCheckDto) {
    const { email, token } = invitationCheckDto;
    const invitation = await this.invitationService.getInvitationByToken({ email, token });
    // Check if invitation still valid
    if (invitation && invitation.status != "pending") {
      throw new BadRequestException();
    }
    try {
      const user = await this.userService.findUserByEmail(invitation.email);
    } catch (error) {
      return false;
    }
    return true;
  }

  @Post("invitation-signup") // Create an account by invitation
  async invitationSignup(@Body() dto: InvitationSignupDto) {
    if (dto.password != dto.confirmPassword) {
      throw new BadRequestException("Password does not match retype password");
    }
    return await this.authService.invitationSignup(dto);
  }

  @Post("clinic-user-login")
  async clinicUserLogin(@Body() dto: ClinicUserLoginDto) {
    return await this.authService.clinicUserLogin(dto);
  }

  @Post("test-clinic")
  async createClinic(@Body() createClinicDto: CreateClinicDto) {
    return await this.clinicService.createClinic(createClinicDto)
  }
  @Get("test-clinic")
  async getClinics() {
    return await this.clinicService.getClinics()
  }

  @Post("test-user")
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const newUser = await this.userService.createUser(createUserDto)
      if (newUser) {
        const event = new UserCreatedEvent(
          newUser.id,
          newUser.email,
          newUser.actorType
        )
        this.messageBroker.emit("user-created", event);
      }
      return newUser;
    } catch (e) {
      if (e.code === '23505') { // Postgres unique violation
        console.log(e)
        throw new BadRequestException({ message: 'Email already exists' });
      }
      throw e;
    }
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
