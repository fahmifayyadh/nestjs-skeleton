import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from '../../modules/auth/auth.service';
import { UsersService } from '../../modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../database/entities/user.entity';
import { UserFixture } from '../fixtures/user.fixture';
import * as bcrypt from 'bcrypt';

/**
 * Auth Service Unit Tests
 * Testing auth business logic tanpa dependencies eksternal
 */
describe('AuthService (Unit Test)', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let userRepository: any;

  beforeEach(async () => {
    // Mock repositories dan services
    const mockUserRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockUsersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateLastLogin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = mockUserRepository;
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = UserFixture.getValidCredentials();
      const mockUser = UserFixture.createMockUser({
        email: registerDto.email,
        name: registerDto.name,
        phone: registerDto.phone,
      });

      // Setup mocks
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.create as jest.Mock).mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock).mockReturnValue('token.jwt.here');

      // Execute
      const result = await service.register(registerDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data.email).toBe(registerDto.email);
      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: registerDto.email,
          name: registerDto.name,
        }),
      );
    });

    it('should fail if email already exists', async () => {
      const registerDto = UserFixture.getValidCredentials();
      const existingUser = UserFixture.createMockUser();

      (usersService.findByEmail as jest.Mock).mockResolvedValue(
        existingUser,
      );

      await expect(service.register(registerDto)).rejects.toThrow();
      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('should hash password before saving', async () => {
      const registerDto = UserFixture.getValidCredentials();
      const mockUser = UserFixture.createMockUser();

      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.create as jest.Mock).mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock).mockReturnValue('token.jwt.here');

      await service.register(registerDto);

      // Verify password was hashed (not plaintext)
      const createCall = (usersService.create as jest.Mock).mock.calls[0][0];
      expect(createCall.password).not.toBe(registerDto.password);
    });
  });

  describe('login', () => {
    it('should successfully login user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'TestPassword@123',
      };
      const mockUser = UserFixture.createMockUser({
        email: loginDto.email,
      });

      // Hash password for comparison
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      mockUser.password = hashedPassword;

      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock).mockReturnValue('token.jwt.here');
      (usersService.updateLastLogin as jest.Mock).mockResolvedValue(undefined);

      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data.accessToken).toBe('token.jwt.here');
      expect(usersService.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
    });

    it('should fail with wrong password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123',
      };
      const mockUser = UserFixture.createMockUser({
        password: 'different-hash',
      });

      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow();
      expect(usersService.updateLastLogin).not.toHaveBeenCalled();
    });

    it('should fail if user not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'Password@123',
      };

      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow();
    });
  });

  describe('profile', () => {
    it('should get user profile', async () => {
      const mockUser = UserFixture.createMockUser();
      const userId = mockUser.id;

      (usersService.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.profile(userId);

      expect(result).toBeDefined();
      expect(result.data).toEqual(mockUser);
      expect(usersService.findById).toHaveBeenCalledWith(userId);
    });

    it('should fail if user not found', async () => {
      (usersService.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.profile('nonexistent-id')).rejects.toThrow();
    });
  });

  describe('forgotPassword', () => {
    it('should generate reset token', async () => {
      const mockUser = UserFixture.createMockUser();
      const email = mockUser.email;

      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (usersService.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.forgotPassword(email);

      expect(result).toBeDefined();
      expect(usersService.update).toHaveBeenCalled();

      const updateCall = (usersService.update as jest.Mock).mock.calls[0];
      expect(updateCall[1]).toHaveProperty('resetPasswordToken');
      expect(updateCall[1]).toHaveProperty('resetPasswordExpires');
    });

    it('should fail if user not found', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(service.forgotPassword('nonexistent@example.com')).rejects.toThrow();
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const token = 'valid-reset-token';
      const newPassword = 'NewPassword@123';
      const mockUser = UserFixture.createMockUser({
        resetPasswordToken: token,
        resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour from now
      });

      (usersService.findById as jest.Mock).mockResolvedValue(mockUser);
      (usersService.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.resetPassword(mockUser.id, token, newPassword);

      expect(result).toBeDefined();
      expect(usersService.update).toHaveBeenCalled();
    });

    it('should fail with expired token', async () => {
      const token = 'expired-token';
      const mockUser = UserFixture.createMockUser({
        resetPasswordToken: token,
        resetPasswordExpires: new Date(Date.now() - 1000), // Expired
      });

      (usersService.findById as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        service.resetPassword(mockUser.id, token, 'NewPassword@123'),
      ).rejects.toThrow();
    });

    it('should fail with wrong token', async () => {
      const mockUser = UserFixture.createMockUser({
        resetPasswordToken: 'correct-token',
        resetPasswordExpires: new Date(Date.now() + 3600000),
      });

      (usersService.findById as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        service.resetPassword(mockUser.id, 'wrong-token', 'NewPassword@123'),
      ).rejects.toThrow();
    });
  });

  describe('validateToken', () => {
    it('should validate correct JWT token', () => {
      const token = 'valid.jwt.token';
      const decoded = { sub: 'user-id', email: 'test@example.com' };

      (jwtService.verify as jest.Mock).mockReturnValue(decoded);

      const result = service.validateToken(token);

      expect(result).toEqual(decoded);
      expect(jwtService.verify).toHaveBeenCalledWith(token);
    });

    it('should fail with invalid token', () => {
      const token = 'invalid.jwt.token';

      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => service.validateToken(token)).toThrow();
    });
  });

  describe('generateAccessToken', () => {
    it('should generate access token with user data', () => {
      const mockUser = UserFixture.createMockUser();

      (jwtService.sign as jest.Mock).mockReturnValue('generated.token.here');

      const result = service.generateAccessToken(mockUser);

      expect(result).toBe('generated.token.here');
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          email: mockUser.email,
        }),
      );
    });
  });
});
