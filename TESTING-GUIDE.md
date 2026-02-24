# 🧪 API Testing Guide - Kios Backend

## Testing Methods

Ada 3 cara untuk test API:

1. **Swagger UI** (Recommended) - Interactive, mudah, no tools needed
2. **Postman** - Feature-rich, save requests, testing
3. **cURL** - Command line, automation

---

## 🌐 Method 1: Swagger UI (Recommended)

### Setup
1. Start server: `npm run dev`
2. Buka browser: `http://localhost:3000/api/docs`
3. Anda akan melihat semua endpoints tercantum

### Testing Steps

#### 1️⃣ Login terlebih dahulu

1. Scroll ke section **Auth** 
2. Click endpoint **POST /auth/login**
3. Click **Try it out**
4. Masukkan body:
```json
{
  "email": "admin@kios.com",
  "password": "Admin@123456"
}
```
5. Click **Execute**
6. Copy access token dari response

#### 2️⃣ Authorize dengan token

1. Scroll ke atas halaman
2. Click button **Authorize** (ikon kunci)
3. Paste access token ke field (tanpa tulisan "Bearer")
4. Click **Authorize**
5. Sekarang Anda authenticated untuk test protected endpoints

#### 3️⃣ Test Endpoints

**Get Profile:**
1. Scroll ke **GET /auth/profile**
2. Click **Try it out**
3. Click **Execute**
4. Lihat response

**Update Profile:**
1. Scroll ke **POST /auth/profile/update**
2. Click **Try it out**
3. Masukkan body:
```json
{
  "name": "Updated Name",
  "profilePicture": "https://example.com/photo.jpg"
}
```
4. Click **Execute**

**Logout:**
1. Scroll ke **POST /auth/logout**
2. Click **Try it out**
3. Click **Execute**

---

## 📮 Method 2: Postman

### Setup

1. **Download** Postman: https://www.postman.com/downloads/
2. **Open** Postman
3. **Import** collection:
   - Click **Import** button
   - Select file `Postman-Collection.json`
   - Click **Import**

### Testing Steps

#### 1️⃣ Set Base URL
1. Lihat tab **Variables** di koleksi
2. Set `baseUrl` = `http://localhost:3000`

#### 2️⃣ Login & Save Token
1. Click request **Login**
2. Lihat tab **Body** - credential sudah terisi
3. Click **Send**
4. Copy `accessToken` dari response
5. Ke tab **Variables** koleksi
6. Paste token ke variable `accessToken`
7. Click **Save**

#### 3️⃣ Test Protected Endpoints
Sekarang Anda bisa test:
- **Get Profile**
- **Update Profile**
- **Logout**

Semua akan otomatis menggunakan token yang disimpan

### Advanced Testing

**Test Register:**
1. Click request **Register**
2. Edit body dengan email baru:
```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "phone": "081234567890",
  "password": "TestPass@123"
}
```
3. Click **Send**

**Test Forgot Password:**
1. Click request **Forgot Password**
2. Edit email:
```json
{
  "email": "admin@kios.com"
}
```
3. Click **Send**
4. Cek console log di terminal untuk reset token

**Test Reset Password:**
1. Dari console log, copy reset token
2. Click request **Reset Password**
3. Edit body:
```json
{
  "token": "PASTE_TOKEN_HERE",
  "newPassword": "NewPass@123456"
}
```
4. Click **Send**

---

## 🖥️ Method 3: cURL (Command Line)

Use on Windows PowerShell, Linux terminal, or Mac terminal

### Setup
Open terminal di folder project

### Testing

#### Register
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

#### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kios.com",
    "password": "Admin@123456"
  }'
```

**Copy access token dari response**

#### Get Profile (Ganti TOKEN dengan access token)
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

#### Update Profile
```bash
curl -X POST http://localhost:3000/auth/profile/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "Updated Name",
    "phone": "081234567890"
  }'
```

#### Forgot Password
```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kios.com"
  }'
```

#### Reset Password
```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "RESET_TOKEN",
    "newPassword": "NewPass@123456"
  }'
```

#### Logout
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer TOKEN"
```

---

## ✅ Manual Testing Checklist

### Happy Path (Normal Flow)

#### 1. Register Flow
```
[ ] Can register new user
[ ] Email validation works
[ ] Password validation works
[ ] Get access token in response
[ ] User created in database
```

#### 2. Login Flow
```
[ ] Can login with correct credentials
[ ] Get access token in response
[ ] Token contains user data
[ ] Cannot login with wrong password
[ ] Cannot login with non-existent email
```

#### 3. Profile Flow
```
[ ] Can get profile with valid token
[ ] Cannot get profile without token
[ ] Cannot get profile with invalid token
[ ] Can update name
[ ] Can update phone
[ ] Can update profile picture
[ ] Updated data reflects in get profile
```

#### 4. Password Reset Flow
```
[ ] Can request forgot password
[ ] Can reset password with valid token
[ ] Cannot reset with invalid token
[ ] Cannot reset with expired token
[ ] Can login with new password
```

#### 5. Logout Flow
```
[ ] Can logout with valid token
[ ] Cannot logout without token
```

### Error Cases (Negative Testing)

#### Validation Errors
```
[ ] Register dengan email kosong → 400
[ ] Register dengan password < 6 char → 400
[ ] Register dengan email invalid → 400
[ ] Login dengan email kosong → 400
[ ] Update dengan data invalid → 400
```

#### Authentication Errors
```
[ ] Get profile tanpa token → 401
[ ] Get profile dengan token invalid → 401
[ ] Get profile dengan token expired → 401
[ ] Update profile tanpa token → 401
```

#### Conflict Errors
```
[ ] Register dengan email yang sudah ada → 409
```

---

## 🔍 Response Validation

### Success Response Format
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    // Endpoint specific data
  },
  "timestamp": "2024-02-23T10:30:00Z"
}
```

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Error message",
  "timestamp": "2024-02-23T10:30:00Z"
}
```

### Validate Response
✅ Always check:
- Status code sesuai
- Message jelas dan bermakna
- Data struktur sesuai spec
- Timestamp present

---

## 📊 Testing Scenarios

### Scenario 1: Complete User Journey

```bash
# 1. Register user baru
POST /auth/register
→ Get access token

# 2. Login dengan email baru
POST /auth/login
→ Get access token (1st login)

# 3. Get profile
GET /auth/profile (with token)
→ See user data, lastLogin updated

# 4. Update profile
POST /auth/profile/update (with token)
→ See updated data

# 5. Logout
POST /auth/logout (with token)
→ Success message
```

**Expected:** Semua step berhasil tanpa error

---

### Scenario 2: Password Reset Flow

```bash
# 1. Forgot password
POST /auth/forgot-password
→ Success message (email akan dikirim)

# 2. Dari console, ambil reset token
# Token biasanya ada di server log

# 3. Reset password dengan token
POST /auth/reset-password
→ Password updated

# 4. Login dengan password baru
POST /auth/login
→ Login berhasil
```

**Expected:** Dapat login dengan password baru

---

### Scenario 3: Invalid Token Flow

```bash
# 1. Try get profile tanpa token
GET /auth/profile
→ 401 Unauthorized

# 2. Try get profile dengan token invalid
GET /auth/profile (Authorization: Bearer invalid)
→ 401 Unauthorized

# 3. Try update tanpa token
POST /auth/profile/update
→ 401 Unauthorized
```

**Expected:** Semua di-reject dengan 401

---

## 🐛 Debugging Tips

### Check Server Logs
```bash
# Terminal where you ran npm run dev
Look for:
- Incoming POST/GET requests
- SQL queries
- Error stack traces
```

### Check Database
```bash
# Terminal lain, jangan stop dev server
mysql -u root -p kios_db

# View users
SELECT id, email, name FROM users;

# Check last login timestamp
SELECT id, email, lastLogin FROM users;
```

### Check Network Tab (Browser)
1. Open browser DevTools (F12)
2. Go to Network tab
3. Make request via Swagger
4. Click request in Network tab
5. See Request & Response headers/body

### Enable Debug Logging
Edit `.env`:
```
NODE_ENV=development  # enables detailed logging
```

---

## 📈 Load Testing (Optional)

Jika ingin test dengan multiple requests:

### Using Apache Bench
```bash
ab -n 100 -c 10 http://localhost:3000/auth/profile
```

### Using Postman Collections (Run)
1. Open Postman collection
2. Click **Run** (button di atas)
3. Set iterations
4. Click **Run**
5. Lihat results

---

## ✨ Best Practices

1. **Test Happy Path First** - Normal flow sebelum error cases
2. **Save Important Data** - Save tokens, copy IDs untuk test selanjutnya
3. **Clear State** - Re-register/seed antara test cycles
4. **Check Timestamps** - Verify createdAt, updatedAt, lastLogin
5. **Monitor Logs** - Check console logs untuk debug info
6. **Documentation** - Screenshot response untuk documentation
7. **Automate** - Use Postman collections untuk automation

---

## 📞 Common Issues During Testing

**Issue: 401 Unauthorized**
```
✓ Check token is copied correctly
✓ Check header format: Authorization: Bearer <token>
✓ Check token not expired
```

**Issue: 400 Bad Request**
```
✓ Check all required fields present
✓ Check variable types (string, number)
✓ Check no typos in field names
✓ Check JSON format valid
```

**Issue: 409 Conflict**
```
✓ Email sudah terdaftar sebelumnya
✓ Use unique email untuk register
```

**Issue: 500 Server Error**
```
✓ Check database connection
✓ Check server logs di terminal
✓ Restart server
```

---

## 🎯 Next Steps

After testing all endpoints:
1. ✅ Review API documentation
2. ✅ Check database records
3. ✅ Try error cases
4. ✅ Build frontend integration
5. ✅ Deploy to production

---

**Happy Testing! 🧪**
