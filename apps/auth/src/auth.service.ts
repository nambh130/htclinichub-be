import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PatientRepository } from './patients/patients.repository';
import { Patient } from './patients/models/patient.entity';
import { LoginDto, UserDocument } from '@app/common';
import { ConfigService } from '@nestjs/config';
import { TokenPayload, UserType } from './interfaces/token-payload.interface';
import { UsersRepository } from './users/users.repository';
import { RpcException } from '@nestjs/microservices';
import { UsersService } from './users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    private readonly patientRepository: PatientRepository
  ) { }

  async patientLogin(phone: string) {
    try {
      var patient = await this.patientRepository.findOne({ phone }, {});
    } catch (error) {
      console.log("hello")
      const newPatient = new Patient({ phone });
      patient = await this.patientRepository.create(newPatient);
    }
    const tokenPayload: TokenPayload = {
      userId: patient.id.toString(),
      userType: UserType.PATIENT
    }
    const expires = new Date();
    const jwtExpiration = Number(
      this.configService.get('JWT_EXPIRES_IN') ?? 3600,
    );
    expires.setSeconds(expires.getSeconds() + jwtExpiration);
      const token = await this.jwtService.signAsync(tokenPayload);

      return { user: patient, token };
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

  async verifyToken(token: string): Promise<TokenPayload> {
    return this.jwtService.verifyAsync(token);
  }

  async validateUser(email: string) {
    return this.usersRepository.findByEmail(email);
  }
}
