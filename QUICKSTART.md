# Kios Backend API - Quick Start

## ⚡ 5 Langkah Cepat Memulai

### Step 1: Setup Database
```bash
# 1. Buat database MySQL
mysql -u root -p -e "CREATE DATABASE kios_db;"

# 2. Update .env dengan credentials MySQL Anda
# Edit file .env:
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=kios_db
```

### Step 2: Install dan Build
```bash
# Install dependencies
npm install

# Compile TypeScript
npm run build
```

### Step 3: Setup Database (Migrations + Seeding)
```bash
# Run migrations (create tables)
npm run migration:run

# Seed database (dummy data)
npm run seed
```

### Step 4: Start Server
```bash
# Development mode
npm run dev

# Atau production mode
npm run build
npm start
```

**Output:**
```
🚀 Kios BE is running on http://localhost:3000
📚 API Documentation: http://localhost:3000/api/docs
```

### Step 5: Test API
- Buka Swagger: `http://localhost:3000/api/docs`
- Atau gunakan Postman: Import `Postman-Collection.json`

---

## 🔐 Login dengan Test Account

```json
{
  "email": "admin@kios.com",
  "password": "Admin@123456"
}
```

---

## 📚 API Endpoints Overview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register user baru | ❌ |
| POST | `/auth/login` | Login user | ❌ |
| GET | `/auth/profile` | Get user profile | ✅ |
| POST | `/auth/profile/update` | Update profile | ✅ |
| POST | `/auth/forgot-password` | Request reset password | ❌ |
| POST | `/auth/reset-password` | Reset password | ❌ |
| POST | `/auth/logout` | Logout user | ✅ |

---

## 📂 Project Structure Summary

```
kios-be/
├── src/
│   ├── modules/
│   │   ├── auth/          ← Authentication (login, register, etc)
│   │   └── users/         ← User management
│   ├── database/
│   │   ├── entities/      ← Database models
│   │   ├── migrations/    ← Database schema versioning
│   │   └── seeders/       ← Dummy data
│   ├── common/            ← Shared utilities (guards, filters, etc)
│   ├── config/            ← Configuration files
│   ├── app.module.ts      ← Root module
│   └── main.ts            ← Entry point
├── dist/                  ← Compiled JavaScript (auto-generated)
├── .env                   ← Environment variables
├── README.md              ← Full documentation
├── INSTALLATION.md        ← Installation guide
├── API-DOCUMENTATION.md   ← API docs
└── package.json           ← Dependencies
```

---

## 🛠️ Commands Reference

```bash
# Development
npm run dev              # Hot-reload development
npm run build            # Compile TypeScript
npm run build:watch      # Watch mode compilation

# Database
npm run migration:run    # Create tables
npm run migration:revert # Undo migration
npm run seed            # Add dummy data

# Production
npm start               # Run compiled app
npm test                # Run tests
```

---

## ✅ Checklist Setup

- [ ] Clone/download project
- [ ] Run `npm install`
- [ ] Create MySQL database
- [ ] Setup `.env` file
- [ ] Run `npm run migration:run`
- [ ] Run `npm run seed`
- [ ] Run `npm run dev`
- [ ] Open `http://localhost:3000/api/docs`
- [ ] Test login dengan `admin@kios.com` / `Admin@123456`

---

## 🚨 Common Issues & Solutions

**Error: "Can't connect to database"**
```bash
# Check MySQL is running
mysql -u root -p

# Check .env configuration
cat .env  # Verify DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD
```

**Error: "Port 3000 already in use"**
```bash
# Windows: Change port in .env
APP_PORT=3001

# Or kill process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Error: "Migration failed"**
```bash
# Revert and try again
npm run migration:revert
npm run migration:run
```

---

## 📖 Documentation Files

- **README.md** - Full project documentation
- **INSTALLATION.md** - Detailed installation steps
- **API-DOCUMENTATION.md** - Complete API reference
- **Postman-Collection.json** - Postman collection for testing
- **Swagger UI** - Interactive docs at `http://localhost:3000/api/docs`

---

## 🆘 Need Help?

1. Check console output untuk error details
2. Baca documentation di `/api/docs`
3. Verify `.env` configuration
4. Ensure MySQL is running
5. Check database connection

---

## 🎉 You're Ready!

Sekarang Anda bisa:
- ✅ Build REST API dengan NestJS
- ✅ Manage authentication (login, register, password reset)
- ✅ Use database migrations & seeders
- ✅ Generate API documentation otomatis
- ✅ Deploy ke production

Happy coding! 🚀
