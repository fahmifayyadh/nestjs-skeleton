import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthController } from '../../modules/auth/auth.controller';
import { AuthService } from '../../modules/auth/auth.service';
import { UserFixture } from '../fixtures/user.fixture';
import { HttpStatus } from '@nestjs/common';

/**
 * Auth Controller Unit Tests
 * Testing controller endpoints dan request handling
 */
describe('AuthController (Unit Test)', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      profile: jest.fn(),
      updateProfile: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      logout: jest.fn(),
      validateToken: jest.fn(),
      generateAccessToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should call authService.register with correct data', async () => {
      const registerDto = UserFixture.getValidCredentials();
      const mockResponse = {
        statusCode: HttpStatus.CREATED,
        message: 'User registered successfully',
        data: UserFixture.createMockUser(),
      };

      (authService.register as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should call authService.login with credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'TestPassword@123',
      };
      const mockResponse = {
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        data: {
          id: 'user-id',
          email: loginDto.email,
          accessToken: 'jwt.token.here',
        },
      };

      (authService.login as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('profile', () => {
    it('should get user profile by request user', async () => {
      const mockUser = UserFixture.createMockUser();
      const request = { user: mockUser };
      const mockResponse = {
        statusCode: HttpStatus.OK,
        message: 'Profile retrieved',
        data: mockUser,
      };

      (authService.profile as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.profile(request as any);

      expect(result).toEqual(mockResponse);
      expect(authService.profile).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const mockUser = UserFixture.createMockUser();
      const request = { user: mockUser };
      const updateDto = UserFixture.getUpdateProfileData();
      const updatedUser = Object.assign(mockUser, updateDto);
      const mockResponse = {
        statusCode: HttpStatus.OK,
        message: 'Profile updated',
        data: updatedUser,
      };

      (authService.updateProfile as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const result = await controller.updateProfile(request as any, updateDto);

      expect(result).toEqual(mockResponse);
      expect(authService.updateProfile).toHaveBeenCalledWith(
        mockUser.id,
        updateDto,
      );
    });
  });

  describe('forgotPassword', () => {
    it('should call forgotPassword with email', async () => {
      const email = 'test@example.com';
      const mockResponse = {
        statusCode: HttpStatus.OK,
        message: 'Password reset email sent',
      };

      (authService.forgotPassword as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const result = await controller.forgotPassword({ email });

      expect(result).toEqual(mockResponse);
      expect(authService.forgotPassword).toHaveBeenCalledWith(email);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with token', async () => {
      const resetDto = {
        token: 'reset-token',
        password: 'NewPassword@123',
      };
      const mockUser = UserFixture.createMockUser();
      const request = { user: mockUser };
      const mockResponse = {
        statusCode: HttpStatus.OK,
        message: 'Password reset successfully',
      };

      (authService.resetPassword as jest.Mock).mockResolvedValue(
        mockResponse,
      );

      const result = await controller.resetPassword(
        request as any,
        resetDto,
      );

      expect(result).toEqual(mockResponse);
      expect(authService.resetPassword).toHaveBeenCalledWith(
        mockUser.id,
        resetDto.token,
        resetDto.password,
      );
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const mockUser = UserFixture.createMockUser();
      const request = { user: mockUser };
      const mockResponse = {
        statusCode: HttpStatus.OK,
        message: 'Logout successful',
      };

      (authService.logout as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.logout(request as any);

      expect(result).toEqual(mockResponse);
      expect(authService.logout).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
