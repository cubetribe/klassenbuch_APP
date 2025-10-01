# Backend Email Auth - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```
✅ Resend package already installed

### Step 2: Set Environment Variables
Create or update `.env.local`:
```env
RESEND_API_KEY=re_123456789  # Get from https://resend.com
EMAIL_FROM=onboarding@resend.dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Run Database Migration
```bash
npx prisma generate
npx prisma migrate dev --name add_email_verification
```

### Step 4: Start Development Server
```bash
npm run dev
```

### Step 5: Test Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "name": "Test User",
    "role": "TEACHER"
  }'
```

Expected response:
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    "role": "TEACHER"
  },
  "emailSent": true
}
```

### Step 6: Check Email
1. Go to [Resend Dashboard](https://resend.com/emails)
2. Find your verification email
3. Copy the token from the URL

### Step 7: Verify Email
```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_TOKEN_HERE"}'
```

Expected response:
```json
{
  "message": "Email verified successfully",
  "email": "test@example.com"
}
```

### Step 8: Test Login
Now the user can log in via NextAuth!

---

## 🧪 Test All Endpoints

### 1. Resend Verification
```bash
curl -X POST http://localhost:3000/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 2. Request Password Reset
```bash
curl -X POST http://localhost:3000/api/auth/request-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 3. Reset Password
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_RESET_TOKEN",
    "newPassword": "NewSecurePass456"
  }'
```

---

## 🔍 Verify Implementation

Check these files were created:
- ✅ `/lib/utils/token.ts`
- ✅ `/lib/email/service.ts`
- ✅ `/app/api/auth/verify-email/route.ts`
- ✅ `/app/api/auth/resend-verification/route.ts`
- ✅ `/app/api/auth/request-reset/route.ts`
- ✅ `/app/api/auth/reset-password/route.ts`

Check these files were modified:
- ✅ `/app/api/auth/register/route.ts`
- ✅ `/lib/auth/config.ts`
- ✅ `/lib/validations/auth.ts`

---

## 🐛 Troubleshooting

### Email Not Sending
- Check `RESEND_API_KEY` is valid
- Check Resend dashboard for errors
- View server console for error logs

### Token Invalid
- Tokens expire (24h verification, 1h reset)
- Use `/api/auth/resend-verification` to get new token

### Login Fails After Verification
- Ensure email was actually verified (check database)
- Check `emailVerified` field in users table

---

## 📚 Full Documentation

- **Complete Report:** `.agents/email-auth-implementation/backend/REPORT.md`
- **Email Service:** `lib/email/README.md`
- **Summary:** `.agents/email-auth-implementation/backend/SUMMARY.md`

---

## ✅ Ready for Frontend Integration

All backend endpoints are working and ready for UI implementation!
