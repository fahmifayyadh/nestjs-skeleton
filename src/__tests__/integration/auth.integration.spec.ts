import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AuthModule } from '../../modules/auth/auth.module';
import { AuthService } from '../../modules/auth/auth.service';
import { UsersService } from '../../modules/users/users.service';
import { User } from '../../database/entities/user.entity';
import { UserFixture } from '../fixtures/user.fixture';
import * as bcrypt from 'bcrypt';

/**
 * Auth Module Integration Tests
 * Testing keseluruhan auth flow dengan real database (in-memory)
 */
describe('AuthModule (Integration Test)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let usersService: UsersService;
  let testUser: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [__dirname + '/../../database/entities/**/*.entity.ts'],
          synchronize: true,
          logging: false,
        }),
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    usersService = moduleFixture.get<UsersService>(UsersService);
  });

  beforeEach(async () => {
    // Create test user untuk setiap test
    const credentials = UserFixture.getValidCredentials();
    const hashedPassword = await bcrypt.hash(credentials.password, 10);

    testUser = await usersService.create({
      ...credentials,
      password: hashedPassword,
    });
  });

  afterEach(async () => {
    // Clean up test data
    if (testUser) {
      await usersService.delete(testUser.id);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete Register & Login Flow', () => {
    it('should register new user and then login', async () => {
      const registerDto = {
        name: 'New User',
        email: 'newuser@example.com',
        phone: '082345678910',
        password: 'NewUser@123456',
      };

      // Register
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CREATED);

      expect(registerResponse.body).toHaveProperty('data');
      expect(registerResponse.body.data.email).toBe(registerDto.email);
      const newUserId = registerResponse.body.data.id;

      // Login with registered user
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: registerDto.email,
          password: registerDto.password,
        })
        .expect(HttpStatus.OK);

      expect(loginResponse.body.data).toHaveProperty('accessToken');
      expect(loginResponse.body.data.email).toBe(registerDto.email);

      // Cleanup
      await usersService.delete(newUserId);
    });
  });

  describe('Profile Management Flow', () => {
    let accessToken: string;

    beforeEach(async () => {
      const credentials = UserFixture.getValidCredentials();
      const hashedPassword = await bcrypt.hash(credentials.password, 10);

      testUser = await usersService.create({
        ...credentials,
        password: hashedPassword,
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: credentials.email,
          password: credentials.password,
        });

      accessToken = loginResponse.body.data.accessToken;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(testUser.email);
    });

    it('should update user profile', async () => {
      const updateDto = UserFixture.getUpdateProfileData();

      const response = await request(app.getHttpServer())
        .post('/auth/profile/update')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateDto)
        .expect(HttpStatus.OK);

      expect(response.body.data.name).toBe(updateDto.name);
      expect(response.body.data.phone).toBe(updateDto.phone);
    });

    it('should reject request without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should reject request with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Password Reset Flow', () => {
    it('should request password reset', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject password reset for nonexistent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Input Validation', () => {
    it('should reject invalid email format in register', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test',
          email: 'invalid-email',
          phone: '082345678910',
          password: 'Password@123',
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject weak password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test',
          email: 'test@example.com',
          phone: '082345678910',
          password: 'weak',
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test',
          email: 'test@example.com',
          // Missing password
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Error Handling', () => {
    it('should return appropriate error for duplicate email', async () => {
      const registerDto = {
        name: 'Duplicate User',
        email: testUser.email, // Using existing email
        phone: '082345678910',
        password: 'Password@123',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(HttpStatus.CONFLICT);
    });

    it('should return 401 for wrong credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword@123',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
