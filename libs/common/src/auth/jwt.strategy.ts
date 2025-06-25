import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ActorType } from '../databases';

interface TokenPayload {
  userId: string,
  actorType: ActorType,
  roles?: string[],
  permissions?: string[],
  isAdmin?: string,
  currentClinics?: string[],
  adminOf?: string[]
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return (
            request?.cookies?.Authentication ||
            request?.headers?.authentication
          );
        },
      ]),
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: TokenPayload) {
    // JWT is already verified and decoded here
    return payload;
  }
}
