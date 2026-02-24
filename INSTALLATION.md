# Kios Backend - Installation & Setup Guide

## 📋 Prasyarat

- Node.js v18+ 
- npm v9+
- MySQL v5.7+
- Visual Studio Code (opsional)

## 🚀 Instalasi Langkah demi Langkah

### 1. Download & Setup Project

```bash
# Clone atau download project
cd e:\node\kios-be

# Install dependencies
npm install

# Compile project
npm run build
```

### 2. Konfigurasi Database

**Buat Database MySQL:**

```sql
CREATE DATABASE kios_db;
CREATE USER 'kios_user'@'localhost' IDENTIFIED BY 'kios_password';
GRANT ALL PRIVILEGES ON kios_db.* TO 'kios_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Setup Environment Variables

Edit file `.env`:

```env
# Application
NODE_ENV=development
APP_NAME=Kios BE
APP_PORT=3000
APP_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=kios_user
DB_PASSWORD=kios_password
DB_NAME=kios_db

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=7d

# Email (Optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@kios.com

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Jalankan Migrations (Buat Tabel Database)

```bash
npm run migration:run
```

**Output yang diharapkan:**
```
✓ Migration CreateUsersTable1697000000000 executed successfully
✓ Migration CreateRefreshTokensTable1697000000001 executed successfully
```

### 5. Seed Database (Tambah Dummy Data)

```bash
npm run seed
```

**Output yang diharapkan:**
```
✓ User admin@kios.com seeded successfully
✓ User test@kios.com seeded successfully
✓ User demo@kios.com seeded successfully

✓ Database seeding completed successfully!
```

### 6. Jalankan Server

**Untuk Development:**
```bash
npm run dev
```

**Untuk Production:**
```bash
npm run build
npm start
```

**Output yang diharapkan:**
```
🚀 Kios BE is running on http://localhost:3000
📚 API Documentation: http://localhost:3000/api/docs
```

## 🧪 Test API

### Menggunakan Swagger

1. Buka browser: `http://localhost:3000/api/docs`
2. Klik endpoint yang ingin di-test
3. Klik "Try it out"
4. Masukkan data yang diperlukan
5. Klik "Execute"

### Menggunakan Postman

1. Import file `Postman-Collection.json` ke Postman
2. Set variable `{{baseUrl}}` = `http://localhost:3000`
3. Test endpoint satu per satu

### Menggunakan cURL

**Login Example:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kios.com",
    "password": "Admin@123456"
  }'
```

**Get Profile Example:**
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📚 Test Account (Dummy Data)

| Email | Password | Role |
|-------|----------|------|
| admin@kios.com | Admin@123456 | Admin |
| test@kios.com | Test@123456 | User |
| demo@kios.com | Demo@123456 | User |

## 🔧 Available Commands

```bash
# Development
npm run dev              # Start dev server dengan hot-reload
npm run build            # Compile TypeScript
npm run build:watch      # Compile TypeScript dengan watch mode

# Database
npm run migration:run    # Jalankan migrations
npm run migration:revert # Revert migration terakhir
npm run seed            # Seed database dengan dummy data

# Testing
npm test                # Run unit tests

# Production
npm run build
npm start               # Start production server
```

## 📁 Struktur File Penting

```
src/
├── modules/
│   ├── auth/              # Authentication module
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── dto/           # Data Transfer Objects
│   └── users/             # User management
│       ├── users.service.ts
│       └── users.module.ts
├── database/
│   ├── entities/          # Database entities
│   │   ├── user.entity.ts
│   │   └── refresh-token.entity.ts
│   ├── migrations/        # Database migrations
│   └── seeders/           # Database seeders
├── common/                # Shared utilities
│   ├── decorators/        # Custom decorators
│   ├── filters/           # Exception filters
│   ├── guards/            # Auth guards
│   └── interceptors/      # Response interceptors
├── config/                # Configuration
├── app.module.ts
└── main.ts               # Entry point
```

## 🔑 Sistem Authentication

### Flow Login:

1. User submit email & password ke `/auth/login`
2. Server validate credentials
3. Server generate JWT access token
4. Return token ke client
5. Client set token di header `Authorization: Bearer <token>`
6. Server validate token untuk setiap request

### Token Payload:

```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "iat": 1234567890,
  "exp": 1234671490
}
```

## 🚨 Troubleshooting

### Error: "Can't reach database"
- Pastikan MySQL sudah running
- Cek konfigurasi di `.env` (host, port, username, password)
- Test koneksi: `mysql -h localhost -u root -p`

### Error: "Port 3000 already in use"
- Ganti port di `.env`: `APP_PORT=3001`
- Atau kill process yang memakai port: 
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Error: "Invalid token"
- Pastikan token belum expired (default 24h)
- Pastikan header format benar: `Authorization: Bearer <token>`
- Generate token baru dengan login

### Migration error
```bash
# Clean database dan jalankan ulang
npm run migration:revert
npm run migration:run
```

## 📝 Best Practices

1. **Jangan commit `.env`** - Selalu gunakan `.env.example`
2. **Ganti JWT_SECRET** di production dengan string yang aman
3. **Gunakan HTTPS** di production
4. **Enable rate limiting** untuk production
5. **Setup email service** untuk forgot password functionality
6. **Add logging** untuk tracking issues
7. **Use database backups** regularly

## 🆘 Support

Jika menghadapi masalah:

1. Cek console log untuk error message
2. Lihat documentation di Swagger (`/api/docs`)
3. Check file `.env` configuration
4. Verify database connection
5. Check database logs

## 📖 API Documentation Lengkap

Selengkapnya bisa dilihat di [README.md](./README.md)

Atau akses Swagger Interactive Documentation:
```
http://localhost:3000/api/docs
```
