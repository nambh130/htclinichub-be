import { HttpException, Inject, Injectable, OnModuleInit, Req, Res } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LoginOtpRequestDto } from './dto/login-otp-request.dto';
import { LoginOtpVerifyDto } from './dto/login-otp-verify.dto';
import {
  AUTH_SERVICE,
  safeKafkaCall,
} from '@app/common';
import { ClientKafka } from '@nestjs/microservices';
import { ClinicUserLoginDto } from './dto/clinic-user-login.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { Request, Response } from 'express';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authClient: ClientKafka,
    private readonly http: HttpService,
    private configService: ConfigService
  ) { }

  async onModuleInit() {
    this.authClient.subscribeToResponseOf('login');
    this.authClient.subscribeToResponseOf('authenticate');
    this.authClient.subscribeToResponseOf('create-user');
    await this.authClient.connect();
  }

  async requestOtp(requestLoginOtp: LoginOtpRequestDto): Promise<{ success: boolean }> {
    console.log("Test env: ", this.configService.get("AUTH_SERVICE_URL"))
    const response = await firstValueFrom(
      this.http.post(`${this.configService.get("AUTH_SERVICE_URL")}/auth/patient/request-otp`, requestLoginOtp)
        .pipe(
          catchError(error => {
            const e = error.response;
            // Rethrow downstream error status/message
            throw new HttpException(e.data, e.status);
          })
        )
    );
    return response.data;
  }

  async verifyOtp(req: Request, res: Response): Promise<any> {
    const response = await firstValueFrom(
      this.http.post(`${this.configService.get("AUTH_SERVICE_URL")}/auth/patient/verify-otp`, req.body)
        .pipe(
          catchError(error => {
            const e = error.response;
            // Rethrow downstream error status/message
            throw new HttpException(e.data, e.status);
          })
        )
    );
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie);
    }

    return res.status(response.status).send(response.data);
  }

  //async clinicUserLogin(loginDto: ClinicUserLoginDto): Promise<{ user: string, token: string }> {
  //  const response = await firstValueFrom(
  //    this.http.post(`${this.configService.get("AUTH_SERVICE_URL")}/auth/clinic/login`, loginDto, {
  //      withCredentials: true
  //    })
  //      .pipe(
  //        catchError(error => {
  //          const e = error.response;
  //          // Rethrow downstream error status/message
  //          throw new HttpException(e.data, e.status);
  //        })
  //      )
  //  );
  //  return response.data;
  //}

  async clinicUserLogin(req: Request, res: Response): Promise<any> {
    console.log("body: ", req.body)
    const response = await firstValueFrom(
      this.http.post(`${this.configService.get("AUTH_SERVICE_URL")}/auth/clinic/login`, req.body, {
        withCredentials: true,
        timeout: 1000 * 20,
      }).pipe(
        catchError(error => {
          const e = error.response;
          throw new HttpException(e?.data || 'Error', e?.status || 500);
        })
      )
    );
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie);
    }

    return res.status(response.status).send(response.data);
  }

  async adminLogin(req: Request, res: Response): Promise<any> {
    console.log("body: ", req.body)
    const response = await firstValueFrom(
      this.http.post(`${this.configService.get("AUTH_SERVICE_URL")}/auth/admin/login`, req.body, {
        withCredentials: true,
        timeout: 1000 * 20,
      }).pipe(
        catchError(error => {
          const e = error.response;
          throw new HttpException(e?.data || 'Error', e?.status || 500);
        })
      )
    );
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      res.setHeader('Set-Cookie', setCookie);
    }

    return res.status(response.status).send(response.data);
  }

  async createInvitation(invitationDto: CreateInvitationDto, req: Request): Promise<any> {
    const cookie = req.headers.cookie; // Grab incoming cookies

    const response = await firstValueFrom(
      this.http.post(
        `${this.configService.get("AUTH_SERVICE_URL")}/invitation`,
        invitationDto,
        {
          headers: {
            Cookie: cookie, // Forward the original cookie
          },
          withCredentials: true, // optional but doesn't hurt
        }
      ).pipe(
        catchError(error => {
          const e = error.response;
          throw new HttpException(e?.data || 'Upstream error', e?.status || 500);
        })
      )
    );
    return response.data;
  }


  async invitationSignup(@Req() req: Request, @Res() res: Response): Promise<any> {
    const response = await firstValueFrom(
      this.http.post(`${this.configService.get("AUTH_SERVICE_URL")}/auth/invitation/signup`, req.body, {
        withCredentials: true
      })
        .pipe(
          catchError(error => {
            const e = error.response;
            // Rethrow downstream error status/message
            throw new HttpException(e.data, e.status);
          })
        )
    );
    return response.data;
  }
  async invitationCheck(req: Request): Promise<any> {
    console.log("body: ", req.body)
    const response = await firstValueFrom(
      this.http.post(`${this.configService.get("AUTH_SERVICE_URL")}/auth/invitation/check`, req.body, {
        withCredentials: true,
        timeout: 1000 * 20,
      }).pipe(
        catchError(error => {
          const e = error.response;
          throw new HttpException(e?.data || 'Error', e?.status || 500);
        })
      )
    );
    return response.data;
  }
  async invitationAccept(@Req() req: Request, @Res() res: Response): Promise<any> {
    const response = await firstValueFrom(
      this.http.post(`${this.configService.get("AUTH_SERVICE_URL")}/auth/invitation/accept`, req.body, {
        headers: req.headers,
        withCredentials: true
      })
        .pipe(
          catchError(error => {
            const e = error.response;
            // Rethrow downstream error status/message
            throw new HttpException(e.data, e.status);
          })
        )
    );
    return response.data;
  }
  //async login(dto: LoginDto): Promise<{ user: UserDocument; token: string }> {
  //  return safeKafkaCall<{ user: UserDocument; token: string }>(
  //    this.authClient.send('login', dto),
  //  );
  //}

  //async createUser(userDto: UserDto): Promise<{ user: any }> {
  //  console.log('Sending create-user message:', userDto);
  //  return safeKafkaCall<{ user: UserDocument }>(
  //    this.authClient.send('create-user', userDto),
  //  );
  //}
}
