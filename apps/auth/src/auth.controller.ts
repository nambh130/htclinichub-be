import { BadRequestException, Body, Controller, Get, Inject, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClientKafka } from '@nestjs/microservices';
import { OtpService } from './otp/otp.service';
import { RequestOtpDto } from './otp/dto/request-otp.dto';
import { VerifyOtpDto } from './otp/dto/verify-otp.dto';
import { CreateClinicDto } from './clinics/dto/create-clinic.dto';
import { ClinicUsersService } from './clinic-users/clinic-users.service';
import { ClinicsService } from './clinics/clinics.service';
import { CreateUserDto } from './clinic-users/dto/create-user.dto';
import { UserCreatedEvent } from '@app/common/events/users/user-created.event';
import { AUTH_SERVICE, CurrentUser, JwtAuthGuard } from '@app/common';
import { InvitationCheckDto } from './dto/invitation-check.dto';
import { InvitationsService } from './invitations/invitations.service';
import { InvitationSignupDto } from './dto/invitation-signup.dto';
import { ClinicUserLoginDto } from './dto/clinic-user-login.dto';
import { Request, Response } from 'express';
import { AuthorizationGuard } from '@app/common/auth/authorization.guard';
import { Authorizations } from '@app/common/decorators/authorizations.decorator';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { TokenPayload } from './interfaces/token-payload.interface';
import { ActorEnum } from '@app/common/enum/actor-type';
import { AdminLoginDto } from './dto/admin-login.dto';

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

  // ------------------------------ PATIENT ------------------------------
  //Patient request an otp to login
  @Post('patient/request-otp')
  async requestOtp(@Body() requestOtpDto: RequestOtpDto) {
    return this.otpService.sendOtp(requestOtpDto);
  }

  //Patient login (or signup) with otp
  @Post('patient/verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Res() res: Response) {
    const isOtpValid = await this.otpService.verifyOtp(verifyOtpDto);

    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const response = await this.authService.patientLogin(verifyOtpDto.phone);

    // Set cookie securely
    res.cookie('Authentication', response.token, {
      httpOnly: true,        // Prevent JS access
      secure: true,          // Use HTTPS only
      sameSite: 'lax',       // Or 'strict' depending on your needs
    });

    // Respond with JSON
    return res.status(200).json({
      success: true,
      response, // Optional: If you want the client to access it as well
    });
  }
  // ------------------------------ STAFF AND DOCTOR ------------------------------
  // Check if the email in the invitation already has an account
  @Post("invitation/check")
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

  @Post("invitation/signup") // Create an account by invitation
  async invitationSignup(@Body() dto: InvitationSignupDto) {
    if (dto.password != dto.confirmPassword) {
      throw new BadRequestException("Password does not match retype password");
    }
    return await this.authService.invitationSignup(dto);
  }

  @Post("invitation/accept") // Create an account by invitation
  @UseGuards(JwtAuthGuard)
  async acceptInvitation(
    @Body() dto: AcceptInvitationDto,
    @CurrentUser() user: TokenPayload
  ) {
    return this.authService.acceptInvitation(user.userId, dto);
  }

  @Post("clinic/login")
  async clinicUserLogin(
    @Body() dto: ClinicUserLoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    if (
      dto.userType != ActorEnum.DOCTOR &&
      dto.userType != ActorEnum.EMPLOYEE
    ) {
      throw new BadRequestException("")
    }
    const response = await this.authService.clinicUserLogin(dto);
    res.cookie('Authentication', response?.token);
    return response;
  }

  @Post("admin/login")
  async adminLogin(
    @Body() dto: AdminLoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const response = await this.authService.clinicUserLogin({
      ...dto, userType: ActorEnum.ADMIN
    });
    res.cookie('Authentication', response?.token);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post("test-clinic")
  async createClinic(@Body() createClinicDto: CreateClinicDto) {
    return await this.clinicService.createClinic(createClinicDto)
  }

  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Authorizations({
    permissions: ['create-user']
  })
  @Get("test-clinic")
  async getClinics(@Req() req: Request) {
    console.log("header: ", req.user)
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
}
