import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@kios.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'User password',
    example: 'Admin@123456',
  })
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}

export class RegisterDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@kios.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'User phone number',
    example: '081234567890',
  })
  @IsNotEmpty()
  @IsString()
  phone!: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'SecurePass@123',
  })
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@kios.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token',
    example: 'token123',
  })
  @IsNotEmpty()
  token!: string;

  @ApiProperty({
    description: 'New password',
    example: 'NewPass@123456',
  })
  @IsNotEmpty()
  @MinLength(6)
  newPassword!: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'John Doe' })
  name!: string;

  @ApiProperty({ example: 'john@kios.com' })
  email!: string;

  @ApiProperty({ example: 'access-token-here' })
  accessToken!: string;

  @ApiProperty({ example: 'refresh-token-here' })
  refreshToken?: string;
}
