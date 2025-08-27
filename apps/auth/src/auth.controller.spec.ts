import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as argon2 from 'argon2';
import { of } from 'rxjs';
import { PatientRepository } from "./patients/patients.repository";
import { InvitationsService } from "./invitations/invitations.service";
import { ClinicRepository } from "./clinics/clinics.repository";
import { RefreshTokenRepository } from "./refresh-token/refresh-token.repository";
import { RoleRepository } from "./roles/roles.repository";
import { ActorEnum } from "./clinic-users/models/clinic-user.entity";
import { ClinicUsersService } from "./clinic-users/clinic-users.service";

// Mock the external libraries
jest.mock('bcrypt');
jest.mock('argon2');

// --- MOCK PROVIDERS ---
// This section creates mock objects for all the dependencies of AuthService.
// We use jest.fn() to create mock functions that we can control in our tests.
const mockPatientRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
};
const mockInvitationService = {
  getInvitationByToken: jest.fn(),
  updateInvitationStatus: jest.fn(),
};
const mockClinicUsersService = {
  find: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  changePassword: jest.fn(),
};
const mockClinicRepository = {
  findOneAndUpdate: jest.fn(),
};
const mockRefreshTokenRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};
const mockRoleRepo = {
  findOne: jest.fn(),
};
const mockKafkaClient = {
  connect: jest.fn().mockResolvedValue(null),
  emit: jest.fn(() => of(true)), // Mock emit to return an observable
};
const mockJwtService = {
  signAsync: jest.fn(),
};
const mockConfigService = {
  get: jest.fn((key: string) => {
    // Provide default mock values for config keys
    if (key === 'JWT_EXPIRES_IN') return '15';
    if (key === 'REFRESH_TOKEN_EXPIRES') return 7 * 24 * 60 * 60 * 1000; // 7 days
    return null;
  }),
};


// --- TEST SUITE ---
describe('AuthService', () => {
  let service: AuthService;

  // Before each test, we create a fresh testing module.
  // This ensures that tests are isolated from each other.
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: PatientRepository, useValue: mockPatientRepository },
        { provide: InvitationsService, useValue: mockInvitationService },
        { provide: ClinicUsersService, useValue: mockClinicUsersService },
        { provide: ClinicRepository, useValue: mockClinicRepository },
        { provide: RefreshTokenRepository, useValue: mockRefreshTokenRepo },
        { provide: RoleRepository, useValue: mockRoleRepo },
        { provide: 'AUTH_SERVICE', useValue: mockKafkaClient },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Reset mocks before each test to clear any previous configurations
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test for the onModuleInit lifecycle hook
  describe('onModuleInit', () => {
    it('should connect to the Kafka client', async () => {
      await service.onModuleInit();
      expect(mockKafkaClient.connect).toHaveBeenCalledTimes(1);
    });
  });

  // Tests for the patientLogin method
  describe('patientLogin', () => {
    const phone = '1234567890';
    const mockPatient = { id: 'patient1', phone };
    const mockToken = 'mock-jwt-token';

    it('should login an existing patient and return a token', async () => {
      mockPatientRepository.findOne.mockResolvedValue(mockPatient);
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.patientLogin(phone);

      expect(mockPatientRepository.findOne).toHaveBeenCalledWith({ phone }, {});
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { userId: mockPatient.id, actorType: ActorEnum.PATIENT },
        { expiresIn: '100y' }
      );
      expect(result).toEqual({ user: mockPatient, token: mockToken });
      expect(mockPatientRepository.create).not.toHaveBeenCalled();
      expect(mockKafkaClient.emit).not.toHaveBeenCalled();
    });

    it('should create a new patient if not found, emit an event, and return a token', async () => {
      mockPatientRepository.findOne.mockResolvedValue(null);
      mockPatientRepository.create.mockResolvedValue(mockPatient);
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.patientLogin(phone);

      expect(mockPatientRepository.create).toHaveBeenCalled();
      expect(mockKafkaClient.emit).toHaveBeenCalledWith('patient-created', expect.any(Object));
      expect(result).toEqual({ user: mockPatient, token: mockToken });
    });
  });

  // Tests for the userLogin method
  describe('userLogin', () => {
    const loginDto = { email: 'test@example.com', password: 'password123', userType: ActorEnum.DOCTOR };
    const mockUser = {
      id: 'user1',
      email: loginDto.email,
      password: 'hashedPassword',
      actorType: ActorEnum.DOCTOR,
      clinics: [],
      ownerOf: [],
      roles: [],
    };
    const mockToken = 'mock-jwt-token';
    const mockRefreshToken = 'mock-refresh-token';

    // Mock the buildTokenPayload to simplify the test
    beforeEach(() => {
        jest.spyOn(service, 'buildTokenPayload').mockReturnValue({
            userId: mockUser.id,
            email: mockUser.email,
            actorType: mockUser.actorType,
            roles: [],
            permissions: [],
            currentClinics: [],
            adminOf: [],
        });
        // Mock createRefreshToken as it involves crypto and argon2
        jest.spyOn(service, 'createRefreshToken').mockResolvedValue(mockRefreshToken);
    });


    it('should login a user with valid credentials', async () => {
      mockClinicUsersService.find.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.userLogin(loginDto);

      expect(mockClinicUsersService.find).toHaveBeenCalledWith({
        email: loginDto.email,
        actorType: loginDto.userType,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(result.token).toBe(mockToken);
      expect(result.refreshToken).toBe(mockRefreshToken);
    });

    it('should throw BadRequestException if user is not found', async () => {
      mockClinicUsersService.find.mockResolvedValue(null);
      await expect(service.userLogin(loginDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid credentials', async () => {
      mockClinicUsersService.find.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.userLogin(loginDto)).rejects.toThrow(BadRequestException);
    });
  });

  // Tests for the invitationSignup method

  // Tests for verifyRefreshToken
  describe('verifyRefreshToken', () => {
    const token = 'selector.verifier';
    const selector = 'selector';
    const verifier = 'verifier';
    const mockRecord = {
        id: 'rt1',
        selector,
        tokenHash: 'hashedVerifier',
        expiresAt: new Date(Date.now() + 100000), // Not expired
    };

    it('should return the record for a valid token', async () => {
        mockRefreshTokenRepo.findOne.mockResolvedValue(mockRecord);
        (argon2.verify as jest.Mock).mockResolvedValue(true);

        const result = await service.verifyRefreshToken(token);

        expect(mockRefreshTokenRepo.findOne).toHaveBeenCalledWith({ selector });
        expect(argon2.verify).toHaveBeenCalledWith(mockRecord.tokenHash, verifier);
        expect(result).toEqual(mockRecord);
    });

    it('should throw UnauthorizedException if token not found', async () => {
        mockRefreshTokenRepo.findOne.mockResolvedValue(null);
        await expect(service.verifyRefreshToken(token)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token is invalid (argon mismatch)', async () => {
        mockRefreshTokenRepo.findOne.mockResolvedValue(mockRecord);
        (argon2.verify as jest.Mock).mockResolvedValue(false);
        await expect(service.verifyRefreshToken(token)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token is expired', async () => {
        const expiredRecord = { ...mockRecord, expiresAt: new Date(Date.now() - 1000) };
        mockRefreshTokenRepo.findOne.mockResolvedValue(expiredRecord);
        (argon2.verify as jest.Mock).mockResolvedValue(true);
        await expect(service.verifyRefreshToken(token)).rejects.toThrow(UnauthorizedException);
    });
  });

});

