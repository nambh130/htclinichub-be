import { HttpException, Inject, Injectable, OnModuleInit } from '@nestjs/common';
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

  async verifyOtp(verifyOtpDto: LoginOtpVerifyDto): Promise<{ user: any; token: string }> {
    const response = await firstValueFrom(
      this.http.post(`${this.configService.get("AUTH_SERVICE_URL")}/auth/patient/verify-otp`, verifyOtpDto)
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

  async clinicUserLogin(loginDto: ClinicUserLoginDto): Promise<{ user: string, token: string }> {
    const response = await firstValueFrom(
      this.http.post(`${this.configService.get("AUTH_SERVICE_URL")}/auth/clinic/login`, loginDto, {
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

  async createInvitation(invitationDto: CreateInvitationDto): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.configService.get("AUTH_SERVICE_URL")}/invitation`, invitationDto, {
          withCredentials: true
        })
          .pipe(
            catchError(error => {
              console.log(error)
              const e = error.response;
              // Rethrow downstream error status/message
              throw new HttpException(e.data, e.status);
            })
          )
      );
      return response.data;
    } catch (error) {
      console.log(error);
    }
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
