# 🧪 Automation Testing Guide - Kios Backend API

Panduan lengkap untuk menjalankan unit tests, integration tests, dan E2E tests pada project Kios Backend API.

## 📚 Daftar Isi

1. [Quick Start](#quick-start)
2. [Testing Structure](#testing-structure)
3. [Unit Tests](#unit-tests)
4. [Integration Tests](#integration-tests)
5. [E2E Tests](#e2e-tests)
6. [Test Coverage](#test-coverage)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [CI/CD Integration](#cicd-integration)

---

## 🚀 Quick Start

### Install Testing Dependencies

```bash
# Sudah ter-install, tapi jika ingin re-install:
npm install --save-dev @nestjs/testing jest ts-jest @types/jest supertest @types/supertest @faker-js/faker jest-mock-extended
```

### Run Tests

```bash
# Run semua tests
npm test

# Run tests dengan watch mode (auto-refresh saat file berubah)
npm run test:watch

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run semua tests dengan coverage report
npm run test:cov

# Run tests di CI/CD environment
npm run test:ci
```

---

## 🏗️ Testing Structure

```
src/
├── __tests__/
│   ├── setup.ts                    # Global setup untuk semua tests
│   ├── test-utils.ts               # Utility functions untuk test setup
│   ├── database-helper.ts           # Helper untuk test database operations
│   ├── fixtures/
│   │   └── user.fixture.ts          # Fixed test data
│   ├── mocks/
│   │   └── mock-data-generator.ts   # Random mock data generator
│   ├── unit/
│   │   ├── auth/
│   │   │   ├── auth.service.spec.ts     # Auth service unit tests
│   │   │   └── auth.controller.spec.ts  # Auth controller unit tests
│   │   └── users/
│   │       └── users.service.spec.ts    # Users service unit tests
│   ├── integration/
│   │   └── auth.integration.spec.ts     # Full auth flow integration tests
│   └── e2e/
│       └── auth.e2e.spec.ts             # End-to-end auth scenario tests
├── modules/
├── config/
└── ...
```

---

## 🧬 Unit Tests

Unit tests menguji **individual functions atau methods** dalam **isolation** (tanpa dependencies eksternal).

### Location
- `src/__tests__/unit/auth/auth.service.spec.ts`
- `src/__tests__/unit/auth/auth.controller.spec.ts`
- `src/__tests__/unit/users/users.service.spec.ts`

### What's Tested

#### Auth Service Unit Tests
✅ User registration dengan validation email
✅ User login dengan password verification
✅ Profile retrieval
✅ Forgot password flow
✅ Reset password flow
✅ Token validation
✅ Access token generation

#### Auth Controller Unit Tests
✅ Register endpoint
✅ Login endpoint
✅ Profile endpoint
✅ Update profile endpoint
✅ Forgot password endpoint
✅ Reset password endpoint
✅ Logout endpoint

#### Users Service Unit Tests
✅ Find user by email
✅ Find user by ID
✅ Create new user
✅ Update user profile
✅ Delete user
✅ Update last login
✅ Get all users
✅ Count users

### Run Unit Tests

```bash
npm run test:unit
npm run test:unit -- --watch
npm run test:unit -- --coverage
```

### Example Unit Test Structure

```typescript
describe('AuthService (Unit Test)', () => {
  let service: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    // Setup mocks
    const mockUsersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    // Create testing module with mocked dependencies
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      // Arrange: Setup data dan mocks
      const registerDto = { email: 'test@example.com', password: '...' };
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.create as jest.Mock).mockResolvedValue(mockUser);

      // Act: Execute function
      const result = await service.register(registerDto);

      // Assert: Verify results
      expect(result.data.email).toBe(registerDto.email);
      expect(usersService.create).toHaveBeenCalled();
    });
  });
});
```

### Mocking Strategy

```typescript
// Mock service methods
const mockUsersService = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

// Mock return values
mockUsersService.findByEmail.mockResolvedValue(mockUser);
mockUsersService.create.mockResolvedValue(newUser);

// Verify calls
expect(mockUsersService.create).toHaveBeenCalledWith(expectedData);
expect(mockUsersService.create).toHaveBeenCalledTimes(1);
```

---

## 🔗 Integration Tests

Integration tests menguji **multiple components bekerja bersama** dengan **real database** (in-memory SQLite).

### Location
- `src/__tests__/integration/auth.integration.spec.ts`

### What's Tested

✅ **Register & Login Flow**
- User bisa mendaftar dan kemudian login
- Email harus unik
- Password di-hash dengan benar
- Token di-generate untuk login user

✅ **Profile Management Flow**
- User bisa retrieve profile mereka dengan token valid
- User bisa update profile dengan token valid
- Request tanpa token ditolak
- Request dengan invalid token ditolak

✅ **Input Validation**
- Email format harus valid
- Password harus cukup kuat
- Required fields harus ada

✅ **Error Handling**
- Return error yang tepat untuk duplicate email
- Return error yang tepat untuk wrong password
- Return error untuk unauthenticated requests

### Run Integration Tests

```bash
npm run test:integration
npm run test:integration -- --watch
npm run test:integration -- --coverage
```

### Example Integration Test

```typescript
describe('Auth Integration Test', () => {
  let app: INestApplication;
  
  beforeAll(async () => {
    // Setup dengan real module dan in-memory database
    const moduleFixture = await Test.createTestingModule({
      imports: [AuthModule], // Import actual module
    }).compile();
    
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should complete register & login flow', async () => {
    // Register user
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Password@123',
        name: 'Test User',
      })
      .expect(201);

    const token = registerRes.body.data.accessToken;

    // Get profile dengan token
    await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
```

---

## 🌐 E2E Tests (End-to-End)

E2E tests menguji **complete user scenarios** dari perspektif user - seperti actual API requests.

### Location
- `src/__tests__/e2e/auth.e2e.spec.ts`

### Scenarios Tested

#### 1. **User Registration Scenario**
```
Register → Verify Email Uniqueness → Validate Input
```

#### 2. **User Login Scenario**
```
Login → Verify Credentials → Get Token
```

#### 3. **Profile Management Scenario**
```
Login → Get Profile → Update Profile → Verify Changes
```

#### 4. **Password Reset Scenario**
```
Forgot Password → Generate Token → Send Email
```

#### 5. **Error Handling & Edge Cases**
```
Missing Fields → Invalid Formats → Extra Fields
```

#### 6. **Response Format Validation**
```
Verify Consistent Response Structure
```

### Run E2E Tests

```bash
npm run test:e2e
npm run test:e2e -- --watch
npm run test:e2e -- --coverage
```

### Example E2E Test

```typescript
describe('E2E: User Registration Scenario', () => {
  it('should complete full registration flow', async () => {
    const newUserData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'JohnDoe@12345',
      phone: '081234567890',
    };

    // Step 1: Register
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(newUserData)
      .expect(201);

    expect(registerRes.body.data.email).toBe(newUserData.email);
    const token = registerRes.body.data.accessToken;

    // Step 2: Verify token works
    const profileRes = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(profileRes.body.data.email).toBe(newUserData.email);

    // Step 3: Try duplicate registration
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(newUserData)
      .expect(409); // Conflict
  });
});
```

---

## 📊 Test Coverage

### Generate Coverage Report

```bash
# Generate coverage report
npm run test:cov

# Will create:
# - coverage/index.html (HTML report)
# - coverage/lcov.info (LCOV format)
# - coverage/coverage-final.json (JSON format)
```

### View Coverage Report

```bash
# Open HTML report di browser
open coverage/index.html  # macOS
start coverage/index.html # Windows
xdg-open coverage/index.html # Linux
```

### Coverage Targets

```
Branches:    70%+
Functions:   70%+
Lines:       70%+
Statements:  70%+
```

### Coverage Metrics

Lihat `jest.config.extended.js` untuk konfigurasi coverage threshold.

---

## 🎯 Best Practices

### 1. **Use Fixtures for Consistent Test Data**

```typescript
// ✅ Good - Use fixtures
const mockUser = UserFixture.createMockUser();
const credentials = UserFixture.getValidCredentials();

// ❌ Bad - Hardcoded data
const user = { id: 'uuid', email: 'test@example.com', ... };
```

### 2. **Use Factories for Complex Objects**

```typescript
// ✅ Good - Use factory
const users = UserFixture.createMockUsers(10);

// ❌ Bad - Manual creation
const users = [];
for (let i = 0; i < 10; i++) {
  users.push({ ... });
}
```

### 3. **Keep Tests Focused**

```typescript
// ✅ Good - Single responsibility
it('should reject weak password', async () => {
  expect(() => validatePassword('weak')).toThrow();
});

// ❌ Bad - Testing multiple things
it('should validate input', async () => {
  expect(() => validatePassword('weak')).toThrow();
  expect(() => validateEmail('bad')).toThrow();
  // ... 10 more assertions
});
```

### 4. **Use Descriptive Test Names**

```typescript
// ✅ Good - Clear what's being tested
it('should return 401 when password is incorrect', () => {});
it('should reject request without authorization header', () => {});

// ❌ Bad - Vague
it('should work', () => {});
it('test login', () => {});
```

### 5. **Follow AAA Pattern**

```typescript
it('should update user profile', async () => {
  // Arrange: Setup test data
  const user = UserFixture.createMockUser();
  const updateData = { name: 'New Name' };

  // Act: Execute the function
  const result = await service.update(user.id, updateData);

  // Assert: Verify the result
  expect(result.name).toBe(updateData.name);
});
```

### 6. **Mock External Dependencies**

```typescript
// ✅ Good - Mock external service
const mockEmailService = { send: jest.fn() };

// ❌ Bad - Use real email service
import { EmailService } from 'external-package';
```

### 7. **Cleanup After Tests**

```typescript
describe('Tests', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(async () => {
    // Cleanup
    await database.clear();
  });

  afterAll(async () => {
    // Final cleanup
    await app.close();
  });
});
```

### 8. **Use Meaningful Assertions**

```typescript
// ✅ Good - Clear assertion messages
expect(result).toEqual(
  expect.objectContaining({
    email: 'test@example.com',
    status: 'active',
  })
);

// ❌ Bad - Generic assertion
expect(result).toBeTruthy();
```

---

## 🔧 Test Utilities

### UserFixture

```typescript
// Create single user
const user = UserFixture.createMockUser();
const adminUser = UserFixture.createMockAdminUser();

// Create multiple users
const users = UserFixture.createMockUsers(5);

// Get valid/invalid credentials
const valid = UserFixture.getValidCredentials();
const invalid = UserFixture.getInvalidCredentials();

// Get update data
const updateData = UserFixture.getUpdateProfileData();
```

### MockDataGenerator

```typescript
// Generate random user
const user = MockDataGenerator.generateUser();

// Generate batch of users
const users = MockDataGenerator.generateUsers(10);

// Generate registration data
const registerData = MockDataGenerator.generateRegisterData();
const batch = MockDataGenerator.generateRegisterDataBatch(5);

// Generate profile update
const update = MockDataGenerator.generateProfileUpdate();
```

### TestDatabaseHelper

```typescript
const dbHelper = new TestDatabaseHelper(dataSource);

// Initialize & cleanup
await dbHelper.initialize();
await dbHelper.cleanAll();
await dbHelper.dropAll();

// User operations
const user = await dbHelper.createUser({ email: 'test@example.com' });
const users = await dbHelper.createUsers(5);
const userByEmail = await dbHelper.getUserByEmail('test@example.com');
const totalUsers = await dbHelper.countUsers();

// Utility
const isConnected = await dbHelper.ping();
await dbHelper.close();
```

---

## 📋 Running Specific Tests

### Run Single File

```bash
npm test -- auth.service.spec.ts
npm test -- auth.controller.spec.ts
npm test -- users.service.spec.ts
```

### Run Tests Matching Pattern

```bash
npm test -- --testNamePattern="register"
npm test -- --testNamePattern="login"
npm test -- --testNamePattern="profile"
```

### Run with Specific Options

```bash
# Verbose output
npm test -- --verbose

# No coverage
npm test -- --collectCoverage=false

# Update snapshots (jika ada)
npm test -- -u

# Run in band (sequential)
npm test -- --runInBand
```

---

## 🐛 Troubleshooting

### Problem: Tests Timeout

```
Jest did not exit one second after the test run has completed
```

**Solution:**
```typescript
// Ensure proper cleanup
afterAll(async () => {
  await app.close();
  await dataSource.destroy();
});

// Or increase timeout
jest.setTimeout(10000); // in setup.ts
```

### Problem: Database Locked

```
SQLITE_CANTOPEN: unable to open database file
```

**Solution:**
```typescript
// Use in-memory database untuk tests
database: ':memory:'

// Or cleanup properly
await dbHelper.dropAll();
```

### Problem: Module Not Found

```
Cannot find module '...'
```

**Solution:**
```typescript
// Check jest.config.js paths
moduleNameMapper: {
  '^src/(.*)$': '<rootDir>/src/$1',
}

// Or use absolute imports
import { AuthService } from 'src/modules/auth/auth.service';
```

### Problem: Performance - Slow Tests

```
Tests running slow
```

**Solution:**
```bash
# Run in parallel (default)
npm run test:cov

# Run in sequential if parallel fails
npm test -- --maxWorkers=1

# Check which tests are slow
npm test -- --logHeapUsage --verbose
```

### Problem: Inconsistent Test Results

**Solution:**
```typescript
// Ensure proper isolation
beforeEach(async () => {
  // Fresh setup untuk each test
  jest.clearAllMocks();
  await dbHelper.cleanAll();
});

// Avoid shared state
// ❌ Bad: global variable
let user;
describe('tests', () => { ... });

// ✅ Good: local variable
describe('tests', () => {
  let user;
  beforeEach(() => { user = ...; });
});
```

---

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - run: npm ci
      - run: npm run build
      - run: npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Running Tests in CI

```bash
# Use CI script
npm run test:ci

# Will:
# - Run all tests
# - Generate coverage
# - Detect memory leaks
# - Fail on first error
```

### Coverage Reporting

```bash
# Generate LCOV report
npm run test:cov

# Upload to service
# - Codecov
# - Coveralls
# - SonarQube
# - Artifactory
```

---

## 📚 Test Commands Summary

```bash
# Basic
npm test                    # Run all tests once
npm run test:watch          # Run tests in watch mode
npm run test:cov            # Generate coverage report

# By Type
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:e2e            # E2E tests only

# Special
npm run test:debug          # Debug mode
npm run test:all            # Run all with no test requirement
npm run test:ci             # CI environment

# Specific Tests
npm test -- auth.service    # Specific file
npm test -- --testNamePattern="register" # Matching pattern
```

---

## 🎯 Next Steps

1. **Run all tests** - `npm test`
2. **Check coverage** - `npm run test:cov`
3. **Add more tests** - untuk fitur baru
4. **Setup CI/CD** - GitHub Actions / GitLab CI
5. **Monitor metrics** - Code coverage trends

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com)

---

**Last Updated:** February 24, 2026  
**Testing Framework:** Jest + NestJS Testing Module + Supertest  
**Coverage Target:** 70%+
