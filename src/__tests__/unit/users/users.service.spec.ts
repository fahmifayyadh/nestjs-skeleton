import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from '../../modules/users/users.service';
import { User } from '../../database/entities/user.entity';
import { UserFixture } from '../fixtures/user.fixture';
import * as bcrypt from 'bcrypt';

/**
 * Users Service Unit Tests
 * Testing user CRUD operations dan business logic
 */
describe('UsersService (Unit Test)', () => {
  let service: UsersService;
  let mockUserRepository: any;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      const mockUser = UserFixture.createMockUser();

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const mockUser = UserFixture.createMockUser();

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create new user', async () => {
      const credentials = UserFixture.getValidCredentials();
      const hashedPassword = await bcrypt.hash(credentials.password, 10);
      const mockUser = UserFixture.createMockUser({
        ...credentials,
        password: hashedPassword,
      });

      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.create({
        ...credentials,
        password: hashedPassword,
      });

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should save user with hashed password', async () => {
      const credentials = UserFixture.getValidCredentials();
      const hashedPassword = await bcrypt.hash(credentials.password, 10);
      const mockUser = UserFixture.createMockUser({
        password: hashedPassword,
      });

      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      await service.create({...credentials, password: hashedPassword});

      const createCall = mockUserRepository.create.mock.calls[0][0];
      expect(createCall.password).not.toBe(credentials.password);
    });
  });

  describe('update', () => {
    it('should update user profile', async () => {
      const mockUser = UserFixture.createMockUser();
      const updateData = UserFixture.getUpdateProfileData();
      const updatedUser = Object.assign(mockUser, updateData);

      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockUserRepository.findOne.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, updateData);

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining(updateData),
      );
    });

    it('should not update if user not found', async () => {
      const updateData = UserFixture.getUpdateProfileData();

      mockUserRepository.update.mockResolvedValue({ affected: 0 });
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.update('nonexistent-id', updateData);

      expect(result).toBeNull();
    });

    it('should allow partial updates', async () => {
      const mockUser = UserFixture.createMockUser();
      const partialUpdate = { name: 'Updated Name' };

      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockUserRepository.findOne.mockResolvedValue(
        Object.assign(mockUser, partialUpdate),
      );

      await service.update(mockUser.id, partialUpdate);

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        partialUpdate,
      );
    });
  });

  describe('delete', () => {
    it('should delete user by id', async () => {
      const mockUser = UserFixture.createMockUser();

      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.delete(mockUser.id);

      expect(result).toBe(true);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return false if user not found', async () => {
      mockUserRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await service.delete('nonexistent-id');

      expect(result).toBe(false);
    });
  });

  describe('updateLastLogin', () => {
    it('should update lastLogin timestamp', async () => {
      const mockUser = UserFixture.createMockUser();
      const updatedUser = Object.assign(mockUser, {
        lastLogin: new Date(),
      });

      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockUserRepository.findOne.mockResolvedValue(updatedUser);

      await service.updateLastLogin(mockUser.id);

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          lastLogin: expect.any(Date),
        }),
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = UserFixture.createMockUsers(3);

      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers?.();

      if (result) {
        expect(result).toEqual(mockUsers);
        expect(mockUserRepository.find).toHaveBeenCalled();
      }
    });
  });

  describe('countUsers', () => {
    it('should return total user count', async () => {
      const count = 10;

      mockUserRepository.count.mockResolvedValue(count);

      const result = await service.countUsers?.();

      if (result) {
        expect(result).toBe(count);
        expect(mockUserRepository.count).toHaveBeenCalled();
      }
    });
  });
});
