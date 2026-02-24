import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto';
import { User } from '@database/entities';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{
    id: string;
    email: string;
    name: string;
    accessToken: string;
  }> {
    const { email, password, name, phone } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await this.usersService.create({
      name,
      email,
      phone,
      password: hashedPassword,
      status: 'active',
    });

    // Generate access token
    const accessToken = this.generateAccessToken(user);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      accessToken,
    };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{
    id: string;
    email: string;
    name: string;
    accessToken: string;
  }> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check user status
    if (user.status !== 'active') {
      throw new UnauthorizedException('User account is inactive');
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    // Generate access token
    const accessToken = this.generateAccessToken(user);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      accessToken,
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: 'If email exists, reset link will be sent' };
    }

    // Generate reset token
    const resetToken = this.jwtService.sign({ sub: user.id, type: 'reset' }, {
      expiresIn: '1h',
    });

    // Store reset token (in production, save to database)
    await this.usersService.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: new Date(Date.now() + 3600000), // 1 hour
    });

    // TODO: Send email with reset link
    console.log(`Reset token for ${email}: ${resetToken}`);

    return { message: 'If email exists, reset link will be sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    try {
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      const user = await this.usersService.findById(userId);
      if (!user || user.resetPasswordToken !== token) {
        throw new UnauthorizedException('Invalid reset token');
      }

      if (new Date() > user.resetPasswordExpires) {
        throw new UnauthorizedException('Reset token has expired');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password and clear reset token
      await this.usersService.update(userId, {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      });

      return { message: 'Password has been reset successfully' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid reset token');
    }
  }

  async logout(userId: string): Promise<{ message: string }> {
    // In a stateless JWT setup, logout is handled on client side
    // But you can invalidate refresh tokens from database if needed
    return { message: 'Logged out successfully' };
  }

  private generateAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('jwt.expiresIn'),
    });
  }
}
