import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
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
import { ConfigService } from '@nestjs/config';
import { OtpPurpose, OtpTargetType } from './constants/enums';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly clinicService: ClinicsService,
    private readonly userService: ClinicUsersService,
    private readonly otpService: OtpService,
    private readonly invitationService: InvitationsService,
    private readonly configService: ConfigService,
    @Inject(AUTH_SERVICE)
    private readonly messageBroker: ClientKafka,
  ) { }

  // ------------------------------ PATIENT ------------------------------
  //Patient request an otp to login
  @Post('patient/request-otp')
  async requestOtp(@Body() requestOtpDto: RequestOtpDto) {
    return this.otpService.sendOtp({
      target: requestOtpDto.phone,
      type: OtpTargetType.PHONE,
      purpose: OtpPurpose.PATIENT_LOGIN
    });
  }

  //Patient login (or signup) with otp
  @Post('patient/verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Res() res: Response) {
    const isOtpValid = await this.otpService.verifyOtp(
      verifyOtpDto.phone,
      OtpTargetType.PHONE,
      OtpPurpose.PATIENT_LOGIN,
      verifyOtpDto.otp
    );

    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const response = await this.authService.patientLogin(verifyOtpDto.phone);
    const { token, user } = response;

    // Set cookie securely
    res.cookie('Authentication', token, {
      httpOnly: true, // Prevent JS access
      secure: true, // Use HTTPS only
      sameSite: 'lax', // Or 'strict' depending on your needs
    });

    // Respond with JSON
    return res.status(200).json({
      success: true,
      user: { id: user.id, phone: user.phone }, // Optional: If you want the client to access it as well
      token
    });
  }
  // ------------------------------ STAFF AND DOCTOR ------------------------------
  // Check if the email in the invitation already has an account
  @Post('invitation/check')
  async checkInvitation(@Body() invitationCheckDto: InvitationCheckDto) {
    const { email, token } = invitationCheckDto;
    const invitation = await this.invitationService.getInvitationByToken({
      email,
      token,
    });
    // Check if invitation still valid
    if (invitation && invitation.status != 'pending') {
      throw new BadRequestException();
    }
    try {
      const user = await this.userService.findUserByEmail(invitation.email);
    } catch (error) {
      return false;
    }
    return true;
  }

  @Post('invitation/signup') // Create an account by invitation
  async invitationSignup(@Body() dto: InvitationSignupDto) {
    if (dto.password != dto.confirmPassword) {
      throw new BadRequestException('Password does not match retype password');
    }
    return await this.authService.invitationSignup(dto);
  }

  @Post('invitation/accept') // Create an account by invitation
  @UseGuards(JwtAuthGuard)
  async acceptInvitation(
    @Body() dto: AcceptInvitationDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.authService.acceptInvitation(user.userId, dto);
  }

  @Post('clinic/login')
  async clinicUserLogin(
    @Body() dto: ClinicUserLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (
      dto.userType != ActorEnum.DOCTOR &&
      dto.userType != ActorEnum.EMPLOYEE
    ) {
      throw new BadRequestException('Invalid user type!');
    }

    const userAgent = req.headers['user-agent'] || '';
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress;

    const response = await this.authService.userLogin(dto, userAgent, ip);
    this.setAuthCookies(res, response.token, response.refreshToken);

    return { user: response.user };
  }

  @Post('admin/login')
  async adminLogin(
    @Body() dto: AdminLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'] || '';
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress;

    const response = await this.authService.userLogin(
      { ...dto, userType: ActorEnum.ADMIN },
      userAgent,
      ip,
    );
    this.setAuthCookies(res, response.token, response.refreshToken);

    return { user: response.user };
  }

  @Post('refresh')
  async refreshToken(@Req() req: Request,
    @Res({ passthrough: true }) res: Response) {
    const rawToken = req.cookies['refreshToken'];
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').toString();
    console.log(rawToken)

    if (!rawToken) throw new UnauthorizedException('Missing refresh token');

    // Step 1: Verify refresh token
    const { userId } = await this.authService.verifyRefreshToken(rawToken);

    // Step 2: Delete the old token
    await this.authService.invalidateRefreshToken(rawToken);

    // Step 3: Generate new refresh token
    const newRefreshToken = await this.authService.createRefreshToken(userId, userAgent, ip);

    // Step 4: Generate new access token
    const user = await this.userService.find({ id: userId });
    const tokenPayload = this.authService.buildTokenPayload(user);
    const accessToken = await this.authService.createJWT(tokenPayload);

    // Step 5: Set new refresh token cookie
    const expireDate = this.configService.get("REFRESH_TOKEN_EXPIRES");
    console.log(expireDate)
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: expireDate, // 7 days
    });

    return { token: accessToken };
  }

  @Post('logout')
  async logout(@Req() req: Request,
    @Res({ passthrough: true }) res: Response) {
    const rawToken = req.cookies['refreshToken'];
    if (rawToken) {
      await this.authService.invalidateRefreshToken(rawToken);
    }

    res.clearCookie('Authentication', {
      path: '/',
    });

    res.clearCookie('refreshToken', {
      path: '/auth/refresh',
    });

    console.log("HELLLOOOO")
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('test-clinic')
  async createClinic(@Body() createClinicDto: CreateClinicDto) {
    return await this.clinicService.createClinic(createClinicDto);
  }

  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Authorizations({
    permissions: ['create-user'],
  })
  @Get('test-clinic')
  async getClinics(@Req() req: Request) {
    console.log('header: ', req.user);
    return await this.clinicService.getClinics();
  }

  @Post('test-user')
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const newUser = await this.userService.createUser(createUserDto);
      if (newUser) {
        const event = new UserCreatedEvent(
          newUser.id,
          newUser.email,
          newUser.actorType,
        );
        this.messageBroker.emit('user-created', event);
      }
      return newUser;
    } catch (e) {
      if (e.code === '23505') {
        // Postgres unique violation
        console.log(e);
        throw new BadRequestException({ message: 'Email already exists' });
      }
      throw e;
    }
  }

  // ------------------ Utilities ---------------------
  setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    // Parse access token expiry in minutes, convert to ms
    const accessTokenExpiryMin = Number(this.configService.get("JWT_EXPIRES_IN") || 15);
    const accessTokenMaxAge = accessTokenExpiryMin * 60 * 1000;

    // Parse refresh token expiry in ms, fallback to 7 days
    const refreshTokenExpiryMs = Number(this.configService.get("REFRESH_TOKEN_EXPIRES"))
      || (7 * 24 * 60 * 60 * 1000);

    console.log(typeof (accessTokenMaxAge), accessTokenMaxAge)
    console.log(typeof (refreshTokenExpiryMs), refreshTokenExpiryMs)
    res.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: accessTokenMaxAge, // ✅ milliseconds
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: refreshTokenExpiryMs, // ✅ milliseconds
    });
  }

}
