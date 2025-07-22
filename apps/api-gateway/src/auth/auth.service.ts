import {
  HttpException,
  Inject,
  Injectable,
  OnModuleInit,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LoginOtpRequestDto } from './dto/login-otp-request.dto';
import { AUTH_SERVICE } from '@app/common';
import { ClientKafka } from '@nestjs/microservices';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { Request, Response } from 'express';
import { AxiosResponse } from 'axios';
import AuthResponse from '@app/common/dto/auth/login-response.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authClient: ClientKafka,
    private readonly http: HttpService,
    private configService: ConfigService,
  ) { }

  async onModuleInit() {
    this.authClient.subscribeToResponseOf('login');
    this.authClient.subscribeToResponseOf('authenticate');
    this.authClient.subscribeToResponseOf('create-user');
    await this.authClient.connect();
  }

  // ------------------- PATIENT -------------------
  async requestOtp(
    requestLoginOtp: LoginOtpRequestDto,
  ): Promise<{ success: boolean }> {
    const response = await firstValueFrom(
      this.http
        .post(
          `${this.configService.get('AUTH_SERVICE_URL')}/auth/patient/request-otp`,
          requestLoginOtp,
        )
        .pipe(
          catchError((error) => {
            const e = error.response;
            // Rethrow downstream error status/message
            throw new HttpException(e.data, e.status);
          }),
        ),
    );
    return response.data;
  }

  async verifyOtp(req: Request, res: Response): Promise<any> {
    const response = await firstValueFrom(
      this.http
        .post(
          `${this.configService.get('AUTH_SERVICE_URL')}/auth/patient/verify-otp`,
          req.body,
        )
        .pipe(
          catchError((error) => {
            const e = error.response;
            // Rethrow downstream error status/message
            throw new HttpException(e.data, e.status);
          }),
        ),
    );
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie);
    }

    return res.status(response.status).send(response.data);
  }

  // ------------------- LOGIN, LOGOUT, REFRESHTOKEN -------------------

  async clinicUserLogin(
    req: Request,
  ): Promise<AxiosResponse<AuthResponse & { refreshToken: string }>> {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const forwardedFor = req.headers['x-forwarded-for'] as string;
    const ip = (
      forwardedFor?.split(',')[0] ||
      req.socket.remoteAddress ||
      ''
    ).trim();

    return await firstValueFrom(
      this.http
        .post(
          `${this.configService.get('AUTH_SERVICE_URL')}/auth/clinic/login`,
          req.body,
          {
            withCredentials: true,
            headers: {
              'x-user-agent': userAgent,
              'x-client-ip': ip,
            },
            timeout: 1000 * 20,
          },
        )
        .pipe(
          catchError((error) => {
            const e = error.response || {};
            throw new HttpException(e.data || 'Gateway error', e.status || 500);
          }),
        ),
    );
  }

  async adminLogin(req: Request, res: Response): Promise<any> {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const forwardedFor = req.headers['x-forwarded-for'] as string;
    const ip = (
      forwardedFor?.split(',')[0] ||
      req.socket.remoteAddress ||
      ''
    ).trim();

    const response = await firstValueFrom(
      this.http
        .post(
          `${this.configService.get('AUTH_SERVICE_URL')}/auth/admin/login`,
          req.body,
          {
            withCredentials: true,
            headers: {
              'x-user-agent': userAgent,
              'x-client-ip': ip,
            },
            timeout: 1000 * 20,
          },
        )
        .pipe(
          catchError((error) => {
            const e = error.response || {};
            throw new HttpException(e.data || 'Gateway error', e.status || 500);
          }),
        ),
    );
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie);
    }

    return res.status(response.status).send(response.data);
  }

  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const forwardedFor = req.headers['x-forwarded-for'] as string;
    const ip = (
      forwardedFor?.split(',')[0] ||
      req.socket.remoteAddress ||
      ''
    ).trim();

    const response = await firstValueFrom(
      this.http
        .post(
          `${this.configService.get('AUTH_SERVICE_URL')}/auth/refresh`,
          {}, // optional body, if Auth service requires it
          {
            withCredentials: true,
            headers: {
              cookie: req.headers.cookie || '',
              'X-User-Agent': userAgent,
              'X-Client-IP': ip,
            },
            timeout: 10000,
          },
        )
        .pipe(
          catchError((error) => {
            const e = error.response || {};
            throw new HttpException(
              e.data || 'Token refresh failed',
              e.status || 500,
            );
          }),
        ),
    );

    const setCookies = response.headers['set-cookie'];
    if (setCookies && Array.isArray(setCookies)) {
      res.setHeader('Set-Cookie', setCookies);
    }

    return res.status(response.status).send(response.data);
  }

  async logout(@Req() req: Request, @Res() res: Response) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const forwardedFor = req.headers['x-forwarded-for'] as string;
    const ip = (
      forwardedFor?.split(',')[0] ||
      req.socket.remoteAddress ||
      ''
    ).trim();

    await firstValueFrom(
      this.http
        .post(
          `${this.configService.get('AUTH_SERVICE_URL')}/auth/logout`,
          {},
          {
            withCredentials: true,
            headers: {
              cookie: req.headers.cookie || '',
              'X-User-Agent': userAgent,
              'X-Client-IP': ip,
            },
            timeout: 10000,
          },
        )
        .pipe(
          catchError((error) => {
            const e = error.response || {};
            throw new HttpException(e.data || 'Logout failed', e.status || 500);
          }),
        ),
    );

    res.clearCookie('Authentication', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });

    return res.json({ message: 'Logged out successfully' }); // ✅ this forces flush
  }
  // ------------------- RECOVER PASSWORD -------------------

  async recoverPassword(req: Request, res: Response): Promise<any> {
    const response = await firstValueFrom(
      this.http
        .post(
          `${this.configService.get('AUTH_SERVICE_URL')}/auth/forget-password`,
          req.body,
        )
        .pipe(
          catchError((error) => {
            const e = error.response;
            // Rethrow downstream error status/message
            throw new HttpException(e.data, e.status);
          }),
        ),
    );
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie);
    }

    return res.status(response.status).send(response.data);
  }

  async resetPassword(req: Request, res: Response): Promise<any> {
    const response = await firstValueFrom(
      this.http
        .post(
          `${this.configService.get('AUTH_SERVICE_URL')}/auth/reset-password`,
          req.body,
        )
        .pipe(
          catchError((error) => {
            const e = error.response;
            // Rethrow downstream error status/message
            throw new HttpException(e.data, e.status);
          }),
        ),
    );
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie);
    }

    return res.status(response.status).send(response.data);
  }
  // ------------------- INVITATIONS -------------------

  async createInvitation(
    invitationDto: CreateInvitationDto,
    req: Request,
  ): Promise<any> {
    const cookie = req.headers.cookie; // Grab incoming cookies

    const response = await firstValueFrom(
      this.http
        .post(
          `${this.configService.get('AUTH_SERVICE_URL')}/invitation`,
          invitationDto,
          {
            headers: {
              Cookie: cookie, // Forward the original cookie
            },
            withCredentials: true, // optional but doesn't hurt
          },
        )
        .pipe(
          catchError((error) => {
            const e = error.response;
            throw new HttpException(
              e?.data || 'Upstream error',
              e?.status || 500,
            );
          }),
        ),
    );
    return response.data;
  }

  async invitationSignup(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const response = await firstValueFrom(
      this.http
        .post(
          `${this.configService.get('AUTH_SERVICE_URL')}/auth/invitation/signup`,
          req.body,
          {
            withCredentials: true,
          },
        )
        .pipe(
          catchError((error) => {
            const e = error.response;
            // Rethrow downstream error status/message
            throw new HttpException(e.data, e.status);
          }),
        ),
    );
    return res.status(response.status).send(response.data);
  }

  async getInvitationByClinic(
    @Query() query: Record<string, any>,
    @Req() req: Request,
  ): Promise<any> {
    const url = new URL(
      `/invitation/clinic`,
      this.configService.get('AUTH_SERVICE_URL'),
    );

    Object.entries(query).forEach(([key, value]) =>
      url.searchParams.append(key, value as string),
    );

    try {
      const response = await firstValueFrom(
        this.http.get(url.toString(), {
          headers: {
            Cookie: req.headers.cookie || '', // Forward incoming cookies
          },
          withCredentials: true, // still recommended
        }),
      );
      return response.data;
    } catch (error) {
      const e = error.response;
      throw new HttpException(e.data, e.status);
    }
  }

  async revokeInvitation(
    query: Record<string, string>,
    req: Request,
  ): Promise<any> {
    const response = await firstValueFrom(
      this.http
        .patch(
          `${this.configService.get('AUTH_SERVICE_URL')}/invitation/${query.id}/revoke`,
          req.body,
          {
            headers: {
              Cookie: req.headers.cookie || '', // Forward incoming cookies
            },
            withCredentials: true,
            timeout: 1000 * 20,
          },
        )
        .pipe(
          catchError((error) => {
            const e = error.response;
            throw new HttpException(e?.data || 'Error', e?.status || 500);
          }),
        ),
    );
    return response.data;
  }

  async invitationCheck(req: Request): Promise<any> {
    const response = await firstValueFrom(
      this.http
        .post(
          `${this.configService.get('AUTH_SERVICE_URL')}/auth/invitation/check`,
          req.body,
          {
            withCredentials: true,
            timeout: 1000 * 20,
          },
        )
        .pipe(
          catchError((error) => {
            const e = error.response;
            throw new HttpException(e?.data || 'Error', e?.status || 500);
          }),
        ),
    );
    return response.data;
  }

  async invitationAccept(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const cookie = req.headers.cookie; // Grab incoming cookies
    const response = await firstValueFrom(
      this.http
        .post(
          `${this.configService.get('AUTH_SERVICE_URL')}/auth/invitation/accept`,
          req.body,
          {
            headers: {
              Cookie: cookie, // Forward the original cookie
            },
            withCredentials: true,
          },
        )
        .pipe(
          catchError((error) => {
            const e = error.response;
            // Rethrow downstream error status/message
            throw new HttpException(e.data, e.status);
          }),
        ),
    );
    return res.status(response.status).send(response.data);
  }
  //-------------------- ROLES --------------------
  //
  async getRolesForClinic(
    @Query() query: Record<string, any>,
    @Req() req: Request,
  ): Promise<any> {
    const url = new URL(
      `/roles/clinic`,
      this.configService.get('AUTH_SERVICE_URL'),
    );

    Object.entries(query).forEach(([key, value]) =>
      url.searchParams.append(key, value as string),
    );

    try {
      const response = await firstValueFrom(
        this.http.get(url.toString(), {
          headers: {
            Cookie: req.headers.cookie || '', // Forward incoming cookies
          },
          withCredentials: true, // still recommended
        }),
      );
      return response.data;
    } catch (error) {
      const e = error.response;
      throw new HttpException(e.data, e.status);
    }
  }

  async createDoctor(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const cookie = req.headers.cookie; // Grab incoming cookies
    const response = await firstValueFrom(
      this.http
        .post(
          `${this.configService.get('AUTH_SERVICE_URL')}/auth/doctor`,
          req.body,
          {
            headers: {
              Cookie: cookie, // Forward the original cookie
            },
            withCredentials: true,
          },
        )
        .pipe(
          catchError((error) => {
            const e = error.response;
            // Rethrow downstream error status/message
            throw new HttpException(e.data, e.status);
          }),
        ),
    );
    return res.status(response.status).send(response.data);
  }
}
