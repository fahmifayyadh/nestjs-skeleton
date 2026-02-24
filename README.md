# Kios Backend API

Professional NestJS Backend API dengan fitur Authentication lengkap, TypeORM database management, migrations, dan seeders.

## 📋 Fitur Utama

- ✅ Authentication (Login, Register, Forgot Password, Reset Password)
- ✅ User Profile Management
- ✅ JWT Token-based Authorization
- ✅ Database Migrations & Seeders
- ✅ Swagger API Documentation
- ✅ Global Exception Handling
- ✅ Request/Response Transformation
- ✅ Input Validation (DTO)
- ✅ TypeORM dengan MySQL
- ✅ Environment Configuration Management

## 🚀 Quick Start

### 1. Setup Database

Pastikan MySQL sudah terinstall dan running. Buat database baru:

```sql
CREATE DATABASE kios_db;
```

### 2. Setup Environment Variables

Copy `.env.example` ke `.env` dan sesuaikan konfigurasi:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=kios_db

JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=7d
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Build Project

```bash
npm run build
```

### 5. Run Migrations (Create Tables)

```bash
npm run migration:run
```

### 6. Seed Database (Dummy Data)

```bash
npm run seed
```

**Akun untuk testing:**
- Email: admin@kios.com | Password: Admin@123456
- Email: test@kios.com | Password: Test@123456
- Email: demo@kios.com | Password: Demo@123456

### 7. Start Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

API Documentation: `http://localhost:3000/api/docs`

## 🧪 Testing

Project ini dilengkapi dengan **comprehensive testing framework** dengan Unit, Integration, dan E2E tests.

### Run Tests

```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:cov            # Coverage report
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:e2e            # E2E tests only
npm run test:ci             # CI environment
```

### Test Coverage

Generate dan view coverage report:

```bash
npm run test:cov
open coverage/index.html
```

### Test Framework

- **Jest** - Testing framework
- **Supertest** - HTTP testing
- **@nestjs/testing** - NestJS testing utilities
- **@faker-js/faker** - Mock data generation

**📚 Baca [TESTING-AUTOMATION.md](./TESTING-AUTOMATION.md) untuk dokumentasi lengkap**

**Statistik Testing:**
- ✅ 235+ test cases
- ✅ 35+ test suites
- ✅ Unit, Integration, E2E coverage
- ✅ 70%+ coverage target

## 📁 Struktur Folder

```
src/
├── modules/
│   ├── auth/          # Authentication module (login, register, password reset)
│   └── users/         # User management module
├── database/
│   ├── entities/      # Database entities (User, RefreshToken)
│   ├── migrations/    # Database migrations
│   └── seeders/       # Database seeders (dummy data)
├── config/            # Configuration files (app, database, jwt)
├── common/            # Shared utilities
│   ├── decorators/    # Custom decorators (CurrentUser)
│   ├── filters/       # Exception filters
│   ├── guards/        # Auth guards (JwtAuthGuard)
│   ├── interceptors/  # Response interceptors
│   └── exceptions/    # Custom exceptions
├── app.module.ts      # Root module
└── main.ts           # Application entry point
```

## 📚 API Endpoints

### Authentication

#### Register
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "081234567890",
  "password": "SecurePass@123"
}

Response:
{
  "statusCode": 201,
  "message": "Success",
  "data": {
    "id": "uuid-string",
    "email": "john@example.com",
    "name": "John Doe",
    "accessToken": "jwt-token-here"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "admin@kios.com",
  "password": "Admin@123456"
}

Response:
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "uuid-string",
    "email": "admin@kios.com",
    "name": "Admin User",
    "accessToken": "jwt-token-here"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Get Profile
```
GET /auth/profile
Authorization: Bearer <access-token>

Response:
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "uuid-string",
    "name": "Admin User",
    "email": "admin@kios.com",
    "phone": "081234567890",
    "profilePicture": null,
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Update Profile
```
POST /auth/profile/update
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "081234567890",
  "profilePicture": "https://example.com/profile.jpg"
}

Response:
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "uuid-string",
    "name": "Updated Name",
    "email": "admin@kios.com",
    "phone": "081234567890",
    "profilePicture": "https://example.com/profile.jpg",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Forgot Password
```
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "admin@kios.com"
}

Response:
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "message": "If email exists, reset link will be sent"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Reset Password
```
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass@123"
}

Response:
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "message": "Password has been reset successfully"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### Logout
```
POST /auth/logout
Authorization: Bearer <access-token>

Response:
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "message": "Logged out successfully"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 🔧 Management Commands

### Database Migrations

**Generate Migration**
```bash
npm run migration:generate -- -n MigrationName
```

**Run Migrations**
```bash
npm run migration:run
```

**Revert Migration**
```bash
npm run migration:revert
```

### Database Seeding

**Run Seeders**
```bash
npm run seed
```

### Development

**Start Dev Server**
```bash
npm run dev
```

**Build Project**
```bash
npm run build
```

**Build with Watch Mode**
```bash
npm run build:watch
```

**Run Tests**
```bash
npm test
```

## 🔐 Authentication Flow

### Request dengan Token
Semua request yang membutuhkan authentication harus menyertakan header:
```
Authorization: Bearer <access-token>
```

### Token Validation
Token akan divalidasi oleh `JwtAuthGuard`. Jika token invalid atau expired, akan mendapat response 401 Unauthorized.

## 📖 API Documentation

Swagger API Documentation tersedia di `http://localhost:3000/api/docs`

Dari page tersebut Anda bisa:
- ✅ Melihat semua endpoints
- ✅ Melihat struktur request dan response
- ✅ Test API langsung dari browser
- ✅ Authorize dengan Bearer Token

## 💾 Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `name` (String, Required)
- `email` (String, Unique, Required)
- `phone` (String, Unique)
- `password` (String, Required)
- `profilePicture` (String, Optional)
- `status` (Enum: active/inactive)
- `resetPasswordToken` (String, Optional)
- `resetPasswordExpires` (DateTime, Optional)
- `lastLogin` (DateTime, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Refresh Tokens Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key to Users)
- `token` (String)
- `expiresAt` (DateTime)
- `createdAt` (DateTime)

## 🛠️ Best Practices yang Digunakan

1. **Clean Architecture**: Pemisahan concerns dengan modules, services, controllers, dan DTOs
2. **Environment Configuration**: Menggunakan dotenv dan NestJS Config module
3. **Database Migration**: TypeORM migrations untuk version control database
4. **Data Validation**: Class-validator dan DTOs untuk input validation
5. **Error Handling**: Global exception filter untuk centralized error handling
6. **Response Transformation**: Global interceptor untuk consistent response format
7. **Security**: JWT authentication dengan bcrypt password hashing
8. **Type Safety**: Full TypeScript implementation
9. **API Documentation**: Swagger/OpenAPI untuk auto-generated documentation

## 📝 Notes

- Semua password akan di-hash menggunakan bcrypt sebelum disimpan
- JWT token default valid selama 24 jam
- Reset password token valid selama 1 jam
- Database configuration dapat disesuaikan via environment variables
- Email functionality untuk password reset dapat dikonfigurasi di email service

## 🤝 Kontribusi

Untuk kontribusi, silakan buat pull request atau issue untuk discussion.

## 📄 License

MIT
