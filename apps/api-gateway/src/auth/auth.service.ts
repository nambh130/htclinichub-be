import { AUTH_SERVICE, UserDto } from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.authClient.subscribeToResponseOf('login');
    this.authClient.subscribeToResponseOf('authenticate');
    this.authClient.subscribeToResponseOf('create-user');
    await this.authClient.connect();
  }

  async login(userDto: UserDto): Promise<{ user: any; token: string }> {
    return firstValueFrom(this.authClient.send('login', userDto));
  }

  async createUser(userDto: UserDto): Promise<{ user: any; token: string }> {
    return firstValueFrom(this.authClient.send('create-user', userDto));
  }
}
