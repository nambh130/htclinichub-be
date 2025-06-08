import {
  AUTH_SERVICE,
  safeKafkaCall,
  UserDocument,
  UserDto,
} from '@app/common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

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

  async login(
    userDto: UserDto,
  ): Promise<{ user: UserDocument; token: string }> {
    return safeKafkaCall<{ user: UserDocument; token: string }>(
      this.authClient.send('login', userDto),
    );
  }

  async createUser(userDto: UserDto): Promise<{ user: any }> {
    console.log('Sending create-user message:', userDto);
    return safeKafkaCall<{ user: UserDocument }>(
      this.authClient.send('create-user', userDto),
    );
  }
}
