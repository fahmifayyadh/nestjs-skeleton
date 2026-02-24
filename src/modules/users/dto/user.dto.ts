import { IsOptional, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe Updated',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'User phone number',
    example: '081234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Profile picture URL',
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  profilePicture?: string;
}

export class UserProfileDto {
  @ApiProperty({ example: 'uuid-string' })
  id!: string;

  @ApiProperty({ example: 'John Doe' })
  name!: string;

  @ApiProperty({ example: 'john@kios.com' })
  email!: string;

  @ApiProperty({ example: '081234567890' })
  phone!: string;

  @ApiProperty({ example: 'https://example.com/profile.jpg' })
  profilePicture!: string;

  @ApiProperty({ example: 'active' })
  status!: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt!: Date;
}
