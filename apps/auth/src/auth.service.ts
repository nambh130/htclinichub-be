import { Injectable } from '@nestjs/common';
import { UserDocument, UserDto } from '@app/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './interfaces/token-payload.interface';
import { UsersRepository } from './users/users.repository';
import { RpcException } from '@nestjs/microservices';
import { UsersService } from './users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly usersService: UsersService,
  ) {}

  async login(
    userDto: UserDto,
  ): Promise<{ user: UserDocument; token: string }> {
    try {
      const user = await this.usersRepository.findByEmail(userDto.email);
      if (!user) {
        throw new RpcException('Invalid credentials');
      }

      // Verify user with raw password input
      await this.usersService.verifyUser(userDto.email, userDto.password);

      // Create token payload
      const tokenPayload = { userId: user._id.toHexString() };

      const token = await this.jwtService.signAsync(tokenPayload);

      return { user, token };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new RpcException({
          message: error.message,
          type: error.name,
          stack: error.stack,
        });
      }

      throw new RpcException({
        message: 'Unknown error',
        type: 'UnknownError',
      });
    }
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync(token);
  }

  async validateUser(email: string) {
    return this.usersRepository.findByEmail(email);
  }
}
