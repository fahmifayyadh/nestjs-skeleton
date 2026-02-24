import { User } from '../../database/entities/user.entity';
import * as bcrypt from 'bcrypt';

/**
 * User Test Fixtures
 * Data fixtures untuk testing user-related functionality
 */

export class UserFixture {
  /**
   * Create mock user object
   */
  static createMockUser(overrides?: Partial<User>): User {
    const user = new User();
    user.id = 'test-uuid-123';
    user.name = 'Test User';
    user.email = 'test@example.com';
    user.phone = '081234567890';
    user.password = 'hashedPassword123';
    user.profilePicture = null;
    user.status = 'active';
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.lastLogin = null;
    user.createdAt = new Date();
    user.updatedAt = new Date();

    return Object.assign(user, overrides);
  }

  /**
   * Create mock admin user
   */
  static createMockAdminUser(): User {
    return this.createMockUser({
      id: 'admin-uuid-001',
      name: 'Admin User',
      email: 'admin@kios.com',
    });
  }

  /**
   * Create multiple mock users
   */
  static createMockUsers(count: number = 3): User[] {
    return Array.from({ length: count }, (_, i) =>
      this.createMockUser({
        id: `user-uuid-${i}`,
        name: `Test User ${i}`,
        email: `user${i}@example.com`,
        phone: `0812345678${i}0`,
      }),
    );
  }

  /**
   * Get valid test user credentials
   */
  static getValidCredentials() {
    return {
      email: 'test@example.com',
      password: 'TestPassword@123',
      name: 'Test User',
      phone: '081234567890',
    };
  }

  /**
   * Get invalid test user credentials
   */
  static getInvalidCredentials() {
    return {
      validEmail: 'invalid-email',
      weakPassword: 'weak',
      missingEmail: {
        password: 'TestPassword@123',
        name: 'Test User',
      },
      missingPassword: {
        email: 'test@example.com',
        name: 'Test User',
      },
    };
  }

  /**
   * Get update profile data
   */
  static getUpdateProfileData() {
    return {
      name: 'Updated Name',
      phone: '089876543210',
      profilePicture: 'https://example.com/avatar.jpg',
    };
  }
}
