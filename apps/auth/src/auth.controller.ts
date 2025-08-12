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
import {
  AUTH_SERVICE,
  CurrentUser,
  JwtAuthGuard,
  TokenPayload,
} from '@app/common';
import { InvitationCheckDto } from './dto/invitation-check.dto';
import { InvitationsService } from './invitations/invitations.service';
import { InvitationSignupDto } from './dto/invitation-signup.dto';
import { ClinicUserLoginDto } from './dto/clinic-user-login.dto';
import { Request, Response } from 'express';
import { AuthorizationGuard } from '@app/common/auth/authorization.guard';
import { Authorizations } from '@app/common/decorators/authorizations.decorator';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { ActorEnum } from '@app/common/enum/actor-type';
import { AdminLoginDto } from './dto/admin-login.dto';
import { ConfigService } from '@nestjs/config';
import { OtpPurpose, OtpTargetType } from './constants/enums';
import { PasswordRecoveryDto } from './dto/user-recover-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import AuthResponse from '@app/common/dto/auth/login-response.dto';
import { CreateDoctorAccount } from './dto/create-doctor-account.dto';
import { ClinicUserCreated } from '@app/common/events/auth/clinic-user-created.event';
import { CreateEmployeeAccount } from './dto/create-clinic-employee.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly clinicService: ClinicsService,
    private readonly userService: ClinicUsersService,
    private readonly otpService: OtpService,
    private readonly invitationService: InvitationsService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
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
      purpose: OtpPurpose.PATIENT_LOGIN,
    });
  }

  //Patient login (or signup) with otp
  @Post('patient/verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Res() res: Response) {
    const isOtpValid = await this.otpService.verifyOtp(
      verifyOtpDto.phone,
      OtpTargetType.PHONE,
      OtpPurpose.PATIENT_LOGIN,
      verifyOtpDto.otp,
    );

    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const response = await this.authService.patientLogin(verifyOtpDto.phone);
    const { token, user } = response || {};

    // Set cookie securely
    res.cookie('Authentication', token, {
      httpOnly: true, // Prevent JS access
      secure: true, // Use HTTPS only
      sameSite: 'lax', // Or 'strict' depending on your needs
    });

    // Respond with JSON
    return res.status(200).json({
      success: true,
      user: { id: user?.id, phone: user?.phone }, // Optional: If you want the client to access it as well
      token,
    });
  }

  // ------------------------------ STAFF AND DOCTOR ------------------------------
  @Post('/change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: TokenPayload
  ) {
    const result = await this.authService.changePassword({
      newPassword: dto.newPassword,
      oldPassword: dto.oldPassword,
      userId: user.userId
    })
    console.log(result)
    return result
  }

  @Post('/doctor')
  async createDoctorAccount(@Body() account: CreateDoctorAccount) {
    const { email, password } = account;
    const createdAccount = await this.authService.createAccount(
      email,
      password,
      'doctor',
    );
    if (createdAccount) {
      this.messageBroker
        .emit(
          'clinic-user-created',
          new ClinicUserCreated({
            id: createdAccount.id,
            email: createdAccount.email,
            actorType: createdAccount.actorType,
          }),
        )
        .subscribe({
          error: (err) => {
            console.error('Failed to emit event:', err);
          },
        });
    }
    return createdAccount;
  }

  @Post('/admin')
  async createAdmin(@Body() account: CreateDoctorAccount) {
    const { email, password } = account;
    const createdAccount = await this.authService.createAccount(
      email,
      password,
      'admin',
    );
    return createdAccount;
  }

  @Post('/clinic-employee')
  async createClinicEmployee(@Body() account: CreateEmployeeAccount) {
    const { email, password, roleId, clinicId } = account;
    const createdAccount = await this.authService.createAccountByRoleId(
      email,
      password,
      roleId,
    );
    if (createdAccount) {
      this.messageBroker
        .emit(
          'clinic-user-created',
          new ClinicUserCreated({
            id: createdAccount.id,
            email: createdAccount.email,
            actorType: createdAccount.actorType,
            clinicId,
          }),
        )
        .subscribe({
          error: (err) => {
            console.error('Failed to emit event:', err);
          },
        });
    }
    return createdAccount;
  }

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
    // Check if doctor already exists
    const user = await this.userService.find({
      email: invitation.email,
      actorType: invitation.role.roleType,
    });
    if (!user) {
      return {
        exists: false,
        clinicId: invitation.clinic.id,
      };
    }

    // If exists, the front end directs to join-clinic
    return {
      exists: true,
      actorType: invitation.role.roleType,
      clinicId: invitation.clinic.id,
    };
  }

  @Post('invitation/signup') // Create an account by invitation
  async invitationSignup(@Body() dto: InvitationSignupDto) {
    if (dto.password != dto.confirmPassword) {
      throw new BadRequestException('Password does not match retype password');
    }
    const response = await this.authService.invitationSignup(dto);
    console.log('check 3', response);
    return response;
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

    return { user: response.user, token: response.token };
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

    return { user: response.user, token: response.token };
  }

  @Post('refresh')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const rawToken = req.cookies['refreshToken'];
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = (
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      'unknown'
    ).toString();

    if (!rawToken) throw new UnauthorizedException('Missing refresh token');

    // Step 1: Verify refresh token
    const { userId } = await this.authService.verifyRefreshToken(rawToken);

    // Step 2: Delete the old token
    await this.authService.invalidateRefreshToken(rawToken);

    // Step 3: Generate new refresh token
    const newRefreshToken = await this.authService.createRefreshToken(
      userId,
      userAgent,
      ip,
    );

    // Step 4: Generate new access token
    const user = await this.userService.find({ id: userId });
    if (!user) throw new BadRequestException('User not found');

    const tokenPayload = this.authService.buildTokenPayload(user);
    const accessToken = await this.authService.createJWT(tokenPayload);

    // Step 5: Set new refresh token cookie
    const expireDate = this.configService.get('REFRESH_TOKEN_EXPIRES');
    console.log(expireDate);
    this.setAuthCookies(res, accessToken, newRefreshToken);

    return {
      token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        actorType: user.actorType,
        roles: tokenPayload.roles ?? [],
        currentClinics: tokenPayload.currentClinics ?? [],
        adminOf: tokenPayload.adminOf ?? [],
      },
    };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawToken = req.cookies['refreshToken'];
    if (rawToken) {
      await this.authService.invalidateRefreshToken(rawToken);
    }

    res.clearCookie('Authentication', {
      path: '/',
    });

    res.clearCookie('refreshToken', {
      path: '/', // MUST match exactly
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('test-clinic')
  async createClinic(@Body() createClinicDto: CreateClinicDto) {
    return await this.clinicService.createClinic(createClinicDto);
  }

  // Create token for password reset
  @Post('forget-password')
  async recoverPassword(@Body() dto: PasswordRecoveryDto) {
    const checkUser = await this.userService.find({
      email: dto.email,
      actorType: dto.actorType,
    });
    if (!checkUser) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Email not found',
        ERR_CODE: 'ENTITY_NOT_FOUND',
      });
    }

    const selector = randomBytes(16).toString('hex'); // used to look up the token
    const token = await this.jwtService.signAsync(
      {
        email: dto.email,
        userType: dto.actorType,
        selector,
      },
      { expiresIn: 60 * 10 },
    );

    return await this.otpService.sendPasswordToken(
      dto.email,
      dto.actorType,
      selector,
      token,
    );
  }

  // Use the token to reset the password
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const { token } = dto;
    const isVerify = await this.jwtService.verifyAsync(
      token,
      this.configService.get('JWT_SECRET'),
    );
    if (!isVerify) {
      throw new BadRequestException('Invalid token');
    }
    const decoded = this.jwtService.decode(token);
    if (!decoded || typeof decoded !== 'object')
      throw new BadRequestException('Invalid token');

    const { email, userType, selector } = decoded;
    const verifyToken = await this.otpService.verifyPasswordToken(
      email,
      userType,
      selector,
    );

    if (!verifyToken) {
      throw new BadRequestException('Invalid token');
    }

    const user = await this.userService.find({
      email: email,
      actorType: userType,
    });
    user.password = await this.userService.hashPassword(dto.password);
    const updatedUser = this.userService.updateUser(email, user);
    if (!updatedUser) {
      throw new Error();
    }
    return { message: 'Change password succesfully' };
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
    const accessTokenExpiryMin = Number(
      this.configService.get('JWT_EXPIRES_IN') || 15,
    );
    const accessTokenMaxAge = accessTokenExpiryMin * 60 * 1000;

    // Parse refresh token expiry in ms, fallback to 7 days
    const refreshTokenExpiryMs =
      Number(this.configService.get('REFRESH_TOKEN_EXPIRES')) ||
      7 * 24 * 60 * 60 * 1000;

    console.log(typeof accessTokenMaxAge, accessTokenMaxAge);
    console.log(typeof refreshTokenExpiryMs, refreshTokenExpiryMs);
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
      path: '/',
      maxAge: refreshTokenExpiryMs, // ✅ milliseconds
    });
  }
}
