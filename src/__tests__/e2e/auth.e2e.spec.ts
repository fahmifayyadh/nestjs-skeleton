import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { AuthService } from '../../modules/auth/auth.service';
import { UsersService } from '../../modules/users/users.service';
import { UserFixture } from '../fixtures/user.fixture';
import * as bcrypt from 'bcrypt';

/**
 * E2E Tests - End-to-End Testing
 * Testing keseluruhan aplikasi seperti user yang menggunakan API
 */
describe('Authentication E2E Tests', () => {
  let app: INestApplication;
  let authService: AuthService;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('DATABASE_CONNECTION')
      .useValue({})
      .compile();

    app = moduleFixture.createNestApplication();

    // Setup global pipes dan interceptors seperti di main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    usersService = moduleFixture.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('1. User Registration Scenario', () => {
    const newUserData = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      phone: '081234567890',
      password: 'JohnDoe@12345',
    };

    it('E2E: Should complete full registration flow', async () => {
      // Step 1: Register user
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send(newUserData)
        .expect(HttpStatus.CREATED);

      expect(registerRes.body).toEqual(
        expect.objectContaining({
          statusCode: HttpStatus.CREATED,
          message: expect.any(String),
          data: expect.objectContaining({
            id: expect.any(String),
            email: newUserData.email,
            name: newUserData.name,
            accessToken: expect.any(String),
          }),
        }),
      );

      const userId = registerRes.body.data.id;
      const token = registerRes.body.data.accessToken;

      // Step 2: Verify token works
      const profileRes = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(profileRes.body.data.email).toBe(newUserData.email);

      // Cleanup
      await usersService.delete(userId);
    });

    it('E2E: Should validate email uniqueness', async () => {
      // Register first user
      const firstRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send(newUserData);

      const userId = firstRes.body.data.id;

      // Try to register with same email
      const duplicateRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send(newUserData)
        .expect(HttpStatus.CONFLICT);

      expect(duplicateRes.body).toHaveProperty('message');

      // Cleanup
      await usersService.delete(userId);
    });

    it('E2E: Should validate input formats', async () => {
      const invalidCases = [
        {
          ...newUserData,
          email: 'invalid-email',
          description: 'Invalid email format',
        },
        {
          ...newUserData,
          password: 'weak',
          description: 'Weak password',
        },
        {
          ...newUserData,
          phone: 'not-a-phone',
          description: 'Invalid phone',
        },
      ];

      for (const testCase of invalidCases) {
        const { description, ...data } = testCase;
        const res = await request(app.getHttpServer())
          .post('/auth/register')
          .send(data);

        expect(res.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  describe('2. User Login Scenario', () => {
    let testUserId: string;
    const loginData = {
      email: 'logintest@example.com',
      password: 'LoginTest@123456',
      name: 'Login Test User',
      phone: '082234567890',
    };

    beforeAll(async () => {
      const hashed = await bcrypt.hash(loginData.password, 10);
      const user = await usersService.create({
        ...loginData,
        password: hashed,
      });
      testUserId = user.id;
    });

    afterAll(async () => {
      if (testUserId) {
        await usersService.delete(testUserId);
      }
    });

    it('E2E: Should complete login flow', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: loginData.email,
          password: loginData.password,
        })
        .expect(HttpStatus.OK);

      expect(res.body).toEqual(
        expect.objectContaining({
          statusCode: HttpStatus.OK,
          message: expect.any(String),
          data: expect.objectContaining({
            id: expect.any(String),
            email: loginData.email,
            accessToken: expect.any(String),
          }),
        }),
      );
    });

    it('E2E: Should reject wrong password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: loginData.email,
          password: 'WrongPassword@123456',
        })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(res.body).toHaveProperty('message');
    });

    it('E2E: Should reject nonexistent user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password@123456',
        })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(res.body).toHaveProperty('message');
    });
  });

  describe('3. Profile Management Scenario', () => {
    let testUserId: string;
    let authToken: string;
    const profileData = {
      email: 'profiletest@example.com',
      password: 'ProfileTest@123456',
      name: 'Profile Test User',
      phone: '083234567890',
    };

    beforeAll(async () => {
      const hashed = await bcrypt.hash(profileData.password, 10);
      const user = await usersService.create({
        ...profileData,
        password: hashed,
      });
      testUserId = user.id;
    });

    beforeEach(async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: profileData.email,
          password: profileData.password,
        });

      authToken = loginRes.body.data.accessToken;
    });

    afterAll(async () => {
      if (testUserId) {
        await usersService.delete(testUserId);
      }
    });

    it('E2E: Should get profile with valid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(res.body.data).toEqual(
        expect.objectContaining({
          id: testUserId,
          email: profileData.email,
          name: profileData.name,
        }),
      );
    });

    it('E2E: Should update profile', async () => {
      const updateData = {
        name: 'Updated Name',
        phone: '089876543210',
      };

      const res = await request(app.getHttpServer())
        .post('/auth/profile/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(HttpStatus.OK);

      expect(res.body.data.name).toBe(updateData.name);
      expect(res.body.data.phone).toBe(updateData.phone);
    });

    it('E2E: Should reject access without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('E2E: Should reject access with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid.token.xyz')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('4. Password Reset Scenario', () => {
    let testUserId: string;
    const resetData = {
      email: 'resettest@example.com',
      password: 'ResetTest@123456',
      name: 'Reset Test User',
      phone: '084234567890',
    };

    beforeAll(async () => {
      const hashed = await bcrypt.hash(resetData.password, 10);
      const user = await usersService.create({
        ...resetData,
        password: hashed,
      });
      testUserId = user.id;
    });

    afterAll(async () => {
      if (testUserId) {
        await usersService.delete(testUserId);
      }
    });

    it('E2E: Should initiate password reset', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: resetData.email,
        })
        .expect(HttpStatus.OK);

      expect(res.body).toEqual(
        expect.objectContaining({
          statusCode: HttpStatus.OK,
          message: expect.any(String),
        }),
      );
    });

    it('E2E: Should reject password reset for nonexistent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com',
        })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('5. Error Handling & Edge Cases', () => {
    it('E2E: Should handle missing required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          // Missing name, phone, password
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body).toHaveProperty('message');
    });

    it('E2E: Should handle extra unexpected fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test',
          email: 'test@example.com',
          phone: '081234567890',
          password: 'Test@123456',
          unexpectedField: 'should be rejected',
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body).toHaveProperty('message');
    });

    it('E2E: Should return consistent error format', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'test',
        });

      // Should have consistent error format
      expect(res.body).toHaveProperty('statusCode');
      expect(res.body).toHaveProperty('message');
      expect(res.status >= 400).toBe(true);
    });
  });

  describe('6. Response Format Validation', () => {
    let authToken: string;
    const testData = {
      email: 'formattest@example.com',
      password: 'FormatTest@123456',
      name: 'Format Test User',
      phone: '085234567890',
    };

    beforeAll(async () => {
      const hashed = await bcrypt.hash(testData.password, 10);
      await usersService.create({
        ...testData,
        password: hashed,
      });
    });

    beforeEach(async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testData.email,
          password: testData.password,
        });

      authToken = loginRes.body.data.accessToken;
    });

    it('E2E: Should return consistent response structure', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.body).toEqual(
        expect.objectContaining({
          statusCode: expect.any(Number),
          message: expect.any(String),
          data: expect.any(Object),
          timestamp: expect.any(String),
        }),
      );
    });

    it('E2E: Should include timestamp in response', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testData.email,
          password: testData.password,
        });

      expect(res.body).toHaveProperty('timestamp');
      expect(new Date(res.body.timestamp)).toBeInstanceOf(Date);
    });
  });
});
