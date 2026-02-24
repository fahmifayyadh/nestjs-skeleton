/**
 * Test Database Helpers
 * Utilities untuk setup dan cleanup test database
 */

import { getDataSourceName, DataSource } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { RefreshToken } from '../../database/entities/refresh-token.entity';

export class TestDatabaseHelper {
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  /**
   * Initialize test database
   */
  async initialize(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }
  }

  /**
   * Clean all tables
   */
  async cleanAll(): Promise<void> {
    const entities = this.dataSource.entityMetadatas;

    for (const entity of entities) {
      const repository = this.dataSource.getRepository(entity.name);
      await repository.delete({});
    }
  }

  /**
   * Clean specific table
   */
  async cleanTable(entity: any): Promise<void> {
    const repository = this.dataSource.getRepository(entity);
    await repository.delete({});
  }

  /**
   * Drop all tables
   */
  async dropAll(): Promise<void> {
    await this.dataSource.dropDatabase();
    await this.dataSource.synchronize();
  }

  /**
   * Sync database schema
   */
  async sync(): Promise<void> {
    await this.dataSource.synchronize();
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }

  /**
   * Get repository instance
   */
  getRepository(entity: any) {
    return this.dataSource.getRepository(entity);
  }

  /**
   * Create user and return with hashed password simulation
   */
  async createUser(userData: {
    email: string;
    name?: string;
    password?: string;
    phone?: string;
  }) {
    const userRepository = this.getRepository(User);
    const user = userRepository.create({
      email: userData.email,
      name: userData.name || 'Test User',
      password: userData.password || 'hashed-password',
      phone: userData.phone || '081234567890',
      status: 'active',
    });

    return userRepository.save(user);
  }

  /**
   * Create multiple users
   */
  async createUsers(count: number = 5) {
    const users = [];
    const userRepository = this.getRepository(User);

    for (let i = 0; i < count; i++) {
      const user = userRepository.create({
        email: `user${i}@test.com`,
        name: `Test User ${i}`,
        password: 'hashed-password',
        phone: `0812345678${i}0`,
        status: 'active',
      });
      users.push(user);
    }

    return userRepository.save(users);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    const userRepository = this.getRepository(User);
    return userRepository.findOne({ where: { email } });
  }

  /**
   * Get user by id
   */
  async getUserById(id: string) {
    const userRepository = this.getRepository(User);
    return userRepository.findOne({ where: { id } });
  }

  /**
   * Get all users
   */
  async getAllUsers() {
    const userRepository = this.getRepository(User);
    return userRepository.find();
  }

  /**
   * Count users
   */
  async countUsers(): Promise<number> {
    const userRepository = this.getRepository(User);
    return userRepository.count();
  }

  /**
   * Create refresh token
   */
  async createRefreshToken(userId: string, token: string, expiresAt: Date) {
    const tokenRepository = this.getRepository(RefreshToken);
    const refreshToken = tokenRepository.create({
      userId,
      token,
      expiresAt,
    });

    return tokenRepository.save(refreshToken);
  }

  /**
   * Verify database connectivity
   */
  async ping(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
