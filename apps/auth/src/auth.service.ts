import { Injectable } from '@nestjs/common';
import { UserDocument, UserDto } from '@app/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { TokenPayload } from './interfaces/token-payload.interface';
import { UsersRepository } from './users/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async login(userDto: UserDto): Promise<string> {
    const user = (await this.usersRepository.findByEmail(
      userDto.email,
    )) as UserDocument;

    const tokenPayload: TokenPayload = {
      userId: user._id.toHexString(),
    };

    const expires = new Date();
    const jwtExpiration = Number(
      this.configService.get('JWT_EXPIRES_IN') ?? 3600,
    );
    expires.setSeconds(expires.getSeconds() + jwtExpiration);

    const token = await this.jwtService.signAsync(tokenPayload);

    return token;
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync(token);
  }

  async validateUser(email: string) {
    return this.usersRepository.findByEmail(email);
  }
}
