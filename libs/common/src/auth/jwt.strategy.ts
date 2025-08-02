import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ActorType } from '@app/common';

interface TokenPayload {
  userId: string;
  actorType: ActorType;
  roles?: string[];
  permissions?: string[];
  isAdmin?: string;
  currentClinics?: string[];
  adminOf?: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          console.log(request?.cookies?.Authentication);
          console.log(configService.get<string>('JWT_SECRET')!);
          const token =
            request?.cookies?.Authentication ||
            request?.headers?.authentication;
          if (!token) {
            console.log('JWT not found');
          } else {
            console.log('JWT token extracted:', token);
          }
          return token;
        },
      ]),
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: TokenPayload) {
    console.log(payload);
    // JWT is already verified and decoded here
    return payload;
  }
}
