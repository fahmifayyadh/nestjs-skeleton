# Dokumentasi API - Kios Backend

## 🔗 Base URL

```
http://localhost:3000
```

## 🔐 Authentication

Semua endpoint yang membutuhkan authentication harus menyertakan header:

```
Authorization: Bearer <access_token>
```

Dapatkan `access_token` dengan cara login ke endpoint `/auth/login`

---

## 📋 Endpoints

### 1️⃣ Auth - Register

**Endpoint:**
```
POST /auth/register
```

**Description:**
Mendaftarkan user baru ke sistem

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "081234567890",
  "password": "SecurePass@123"
}
```

**Response Success (201):**
```json
{
  "statusCode": 201,
  "message": "Success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-02-23T10:30:00.000Z"
}
```

**Response Error (409):**
```json
{
  "statusCode": 409,
  "message": "Email already registered",
  "timestamp": "2024-02-23T10:30:00.000Z"
}
```

**Validasi:**
- `name`: Required, string
- `email`: Required, valid email format, unique
- `phone`: Required, string
- `password`: Required, minimum 6 characters

---

### 2️⃣ Auth - Login

**Endpoint:**
```
POST /auth/login
```

**Description:**
Login user dengan email dan password

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "email": "admin@kios.com",
  "password": "Admin@123456"
}
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@kios.com",
    "name": "Admin User",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-02-23T10:30:00.000Z"
}
```

**Response Error (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "timestamp": "2024-02-23T10:30:00.000Z"
}
```

**Validasi:**
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters

---

### 3️⃣ Auth - Get Profile

**Endpoint:**
```
GET /auth/profile
```

**Description:**
Mendapatkan profile user yang sedang login

**Request Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Admin User",
    "email": "admin@kios.com",
    "phone": "081234567890",
    "profilePicture": "https://example.com/profile.jpg",
    "status": "active",
    "createdAt": "2024-02-23T08:00:00.000Z",
    "updatedAt": "2024-02-23T10:30:00.000Z"
  },
  "timestamp": "2024-02-23T10:30:00.000Z"
}
```

**Response Error (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized - Invalid or missing token",
  "timestamp": "2024-02-23T10:30:00.000Z"
}
```

**Requirements:**
- Harus authenticated dengan valid JWT token

---

### 4️⃣ Auth - Update Profile

**Endpoint:**
```
POST /auth/profile/update
```

**Description:**
Update profile user yang sedang login

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "081234567890",
  "profilePicture": "https://example.com/new-profile.jpg"
}
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Name",
    "email": "admin@kios.com",
    "phone": "081234567890",
    "profilePicture": "https://example.com/new-profile.jpg",
    "status": "active",
    "createdAt": "2024-02-23T08:00:00.000Z",
    "updatedAt": "2024-02-23T10:35:00.000Z"
  },
  "timestamp": "2024-02-23T10:35:00.000Z"
}
```

**Response Error (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized - Invalid or missing token",
  "timestamp": "2024-02-23T10:30:00.000Z"
}
```

**Validasi:**
- `name`: Optional, string
- `phone`: Optional, string
- `profilePicture`: Optional, string (URL)
- Minimal update salah satu field

**Requirements:**
- Harus authenticated dengan valid JWT token

---

### 5️⃣ Auth - Forgot Password

**Endpoint:**
```
POST /auth/forgot-password
```

**Description:**
Request reset password link (akan dikirim ke email, currently di-log di console)

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "email": "admin@kios.com"
}
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "message": "If email exists, reset link will be sent"
  },
  "timestamp": "2024-02-23T10:30:00.000Z"
}
```

**Note:**
- Endpoint akan return success message regardless apakah email exists atau tidak (untuk security)
- Reset token akan di-log di console (untuk development)
- Untuk production, integrasikan dengan email service

**Validasi:**
- `email`: Required, valid email format

---

### 6️⃣ Auth - Reset Password

**Endpoint:**
```
POST /auth/reset-password
```

**Description:**
Reset password menggunakan token dari email

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NewSecurePass@123"
}
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "message": "Password has been reset successfully"
  },
  "timestamp": "2024-02-23T10:30:00.000Z"
}
```

**Response Error (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid reset token",
  "timestamp": "2024-02-23T10:30:00.000Z"
}
```

**Response Error (401 - Expired):**
```json
{
  "statusCode": 401,
  "message": "Reset token has expired",
  "timestamp": "2024-02-23T10:30:00.000Z"
}
```

**Validasi:**
- `token`: Required, valid JWT reset token
- `newPassword`: Required, minimum 6 characters
- Token harus belum expired (valid 1 jam)

---

### 7️⃣ Auth - Logout

**Endpoint:**
```
POST /auth/logout
```

**Description:**
Logout user (dalam implementasi stateless JWT, logout dihandle di client side dengan menghapus token)

**Request Headers:**
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Success (200):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "message": "Logged out successfully"
  },
  "timestamp": "2024-02-23T10:30:00.000Z"
}
```

**Response Error (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized - Invalid or missing token",
  "timestamp": "2024-02-23T10:30:00.000Z"
}
```

**Requirements:**
- Harus authenticated dengan valid JWT token

---

## 📊 Status Code Reference

| Code | Meaning | Contoh |
|------|---------|--------|
| 200 | OK | Login berhasil |
| 201 | Created | Register berhasil |
| 400 | Bad Request | Validation error (field kosong, format invalid) |
| 401 | Unauthorized | Token invalid/expired, credentials salah |
| 404 | Not Found | Resource tidak ditemukan |
| 409 | Conflict | Data conflict (email sudah terdaftar) |
| 500 | Server Error | Server error |

---

## 🔑 Test Credentials

| Email | Password |
|-------|----------|
| admin@kios.com | Admin@123456 |
| test@kios.com | Test@123456 |
| demo@kios.com | Demo@123456 |

---

## 💡 Tips & Tricks

### Menyimpan Access Token

Setelah login, simpan access token untuk request berikutnya:

**JavaScript (Fetch):**
```javascript
const response = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@kios.com',
    password: 'Admin@123456'
  })
});

const data = await response.json();
const accessToken = data.data.accessToken;

// Simpan ke localStorage
localStorage.setItem('accessToken', accessToken);
```

### Menggunakan Access Token untuk Request

```javascript
const accessToken = localStorage.getItem('accessToken');

const response = await fetch('http://localhost:3000/auth/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const data = await response.json();
console.log(data.data);
```

### Refresh Token Manual

Jika token expired, user perlu login ulang untuk mendapatkan token baru.

---

## 🚀 Contoh Integration (cURL)

**Register:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "081234567890",
    "password": "SecurePass@123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kios.com",
    "password": "Admin@123456"
  }'
```

**Get Profile:**
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Update Profile:**
```bash
curl -X POST http://localhost:3000/auth/profile/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Updated Name",
    "phone": "081234567890"
  }'
```

**Logout:**
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📖 Interactive Documentation

Untuk interactive documentation dan testing, buka:

```
http://localhost:3000/api/docs
```

Dari page tersebut Anda bisa:
- ✅ Melihat semua endpoints
- ✅ Melihat struktur request dan response
- ✅ Test API langsung dari browser dengan UI
- ✅ Authorize dengan Bearer Token
