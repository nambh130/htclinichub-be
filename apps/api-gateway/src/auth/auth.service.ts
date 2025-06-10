import { HttpException, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LoginOtpRequestDto } from './dto/login-otp-request.dto';
import { LoginOtpVerifyDto } from './dto/login-otp-verify.dto';
import {
  AUTH_SERVICE,
  LoginDto,
  safeKafkaCall,
  UserDocument,
  UserDto,
} from '@app/common';
import { ClientKafka } from '@nestjs/microservices';

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

  async requestOtp(requestLoginOtp: LoginOtpRequestDto): Promise<{ user: any; token: string }> {
    console.log("Test env: ", this.configService.get("AUTH_SERVICE_URL"))
    const response = await firstValueFrom(
      this.http.post(`${this.configService.get("AUTH_SERVICE_URL")}/auth/request-otp`, requestLoginOtp)
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
      this.http.post(`${this.configService.get("AUTH_SERVICE_URL")}/auth/verify-otp`, verifyOtpDto)
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

  async login(dto: LoginDto): Promise<{ user: UserDocument; token: string }> {
    return safeKafkaCall<{ user: UserDocument; token: string }>(
      this.authClient.send('login', dto),
    );
  }

  async createUser(userDto: UserDto): Promise<{ user: any }> {
    console.log('Sending create-user message:', userDto);
    return safeKafkaCall<{ user: UserDocument }>(
      this.authClient.send('create-user', userDto),
    );
  }
}
