/**
 * Mock Data Generator
 * Generate realistic mock data untuk testing
 */

import * as faker from '@faker-js/faker';
import { User } from '../../database/entities/user.entity';

export class MockDataGenerator {
  /**
   * Generate random user data
   */
  static generateUser(overrides?: Partial<User>): User {
    const user = new User();
    user.id = faker.string.uuid();
    user.name = faker.person.fullName();
    user.email = faker.internet.email().toLowerCase();
    user.phone = faker.phone.number('+62812########');
    user.password = 'hashed-password-' + faker.string.alphanumeric(20);
    user.profilePicture = faker.image.avatar();
    user.status = 'active';
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.lastLogin = faker.date.recent();
    user.createdAt = faker.date.past();
    user.updatedAt = faker.date.recent();

    return Object.assign(user, overrides);
  }

  /**
   * Generate multiple users
   */
  static generateUsers(count: number = 10): User[] {
    return Array.from({ length: count }, () => this.generateUser());
  }

  /**
   * Generate registration data
   */
  static generateRegisterData() {
    return {
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      phone: faker.phone.number('+62812########'),
      password: 'TestPassword@' + faker.string.numeric(5),
    };
  }

  /**
   * Generate multiple registration data
   */
  static generateRegisterDataBatch(count: number = 5) {
    return Array.from({ length: count }, () =>
      this.generateRegisterData(),
    );
  }

  /**
   * Generate login data
   */
  static generateLoginData(email?: string, password?: string) {
    return {
      email: email || faker.internet.email().toLowerCase(),
      password: password || 'TestPassword@' + faker.string.numeric(5),
    };
  }

  /**
   * Generate profile update data
   */
  static generateProfileUpdate() {
    return {
      name: faker.person.fullName(),
      phone: faker.phone.number('+62812########'),
      profilePicture: faker.image.avatar(),
    };
  }

  /**
   * Generate multiple profile updates
   */
  static generateProfileUpdates(count: number = 5) {
    return Array.from({ length: count }, () => this.generateProfileUpdate());
  }
}
