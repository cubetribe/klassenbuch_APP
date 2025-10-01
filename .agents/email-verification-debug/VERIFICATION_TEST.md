# Email Verification - Quick Verification Tests

## Test 1: Verify API Contract (Before Deployment)

### Check Backend Expects Token in Body

```bash
# Read the POST handler
grep -A 10 "export async function POST" app/api/auth/verify-email/route.ts
```

**Expected Output**: Should show `const body = await request.json();`

### Check Frontend Sends Token in Body

```bash
# Read the verifyEmail method
grep -A 8 "verifyEmail: async" lib/api-client.ts
```

**Expected Output**: Should show `body: JSON.stringify({ token })`

✅ **VERIFIED**: Frontend and backend now match!

---

## Test 2: Local Testing (If Database Available)

### Start Development Server
```bash
npm run dev
```

### Test Registration Flow
1. Open http://localhost:3000/register
2. Register with test email: `test-$(date +%s)@example.com`
3. Copy verification token from database:
   ```bash
   # If using Prisma Studio
   npx prisma studio

   # Or query directly
   psql $DATABASE_URL -c "SELECT email, verification_token FROM users WHERE email LIKE 'test-%' ORDER BY created_at DESC LIMIT 1;"
   ```

### Test Verification with Token
```bash
# Replace {TOKEN} with actual token from database
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"{TOKEN}"}'
```

**Expected Response**:
```json
{
  "message": "Email verified successfully",
  "email": "test-...@example.com"
}
```

### Test Frontend Page
```bash
# Open verification page with token
open "http://localhost:3000/verify-email/{TOKEN}"
```

**Expected**: Success page with green checkmark

---

## Test 3: Production Testing (After Deployment)

### Quick Smoke Test
```bash
# Test with invalid token (should fail gracefully)
curl -X POST https://klassenbuch-app.vercel.app/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"invalid-token-12345"}' \
  -v
```

**Expected Response**: 404 with message "Invalid verification token"
**Should NOT Get**: 500 error

### Full End-to-End Test
1. Register new account on production
2. Wait for email (< 30 seconds)
3. Click verification link
4. Verify success page appears
5. Login with verified account

---

## Test 4: Network Inspection (Browser DevTools)

### Before Fix (What was happening)
```
Request:
  Method: POST
  URL: /api/auth/verify-email?token=abc123
  Body: (empty)

Response:
  Status: 500 Internal Server Error
  Body: { "error": "Validation error" }
```

### After Fix (What should happen now)
```
Request:
  Method: POST
  URL: /api/auth/verify-email
  Headers: Content-Type: application/json
  Body: { "token": "abc123..." }

Response:
  Status: 200 OK
  Body: {
    "message": "Email verified successfully",
    "email": "user@example.com"
  }
```

---

## Test 5: Database State Verification

### Before Verification
```sql
SELECT id, email, emailVerified, verificationToken
FROM users
WHERE email = 'test@example.com';
```

**Expected**:
- `emailVerified`: NULL
- `verificationToken`: (some UUID string)

### After Verification
```sql
SELECT id, email, emailVerified, verificationToken
FROM users
WHERE email = 'test@example.com';
```

**Expected**:
- `emailVerified`: (timestamp, e.g., 2025-10-01 12:30:45)
- `verificationToken`: NULL

---

## Test 6: Edge Cases

### Test Already Verified Email
```bash
# Try to verify same token twice
curl -X POST https://klassenbuch-app.vercel.app/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"{ALREADY_USED_TOKEN}"}' \
  -v
```

**Expected Response**: 404 "Invalid verification token" (token was set to NULL after first use)

### Test Empty Token
```bash
curl -X POST https://klassenbuch-app.vercel.app/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":""}' \
  -v
```

**Expected Response**: 400 "Verification token is required"

### Test Missing Token
```bash
curl -X POST https://klassenbuch-app.vercel.app/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{}' \
  -v
```

**Expected Response**: 400 "Verification token is required"

### Test Malformed JSON
```bash
curl -X POST https://klassenbuch-app.vercel.app/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d 'not json' \
  -v
```

**Expected Response**: 400 or 500 with JSON parsing error

---

## Test 7: Security Checks

### Test SQL Injection Attempt
```bash
curl -X POST https://klassenbuch-app.vercel.app/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"abc123; DROP TABLE users;--"}' \
  -v
```

**Expected**: Should be safely handled by Prisma (parameterized queries)
**Should NOT**: Drop any tables or cause database errors

### Test XSS Attempt
```bash
curl -X POST https://klassenbuch-app.vercel.app/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"<script>alert(1)</script>"}' \
  -v
```

**Expected**: Token not found (no XSS execution)

---

## Test 8: Load Testing (Optional)

### Concurrent Verification Attempts
```bash
# Test multiple simultaneous verifications
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/verify-email \
    -H "Content-Type: application/json" \
    -d '{"token":"test-token-'$i'"}' &
done
wait
```

**Expected**: All requests handled correctly without race conditions

---

## Test 9: Monitoring Vercel Logs

After deployment, check Vercel logs:

```bash
# View recent logs
vercel logs klassenbuch-app --follow
```

**Look for**:
- ❌ No more 500 errors from `/api/auth/verify-email`
- ✅ 200 responses for valid tokens
- ✅ 404 responses for invalid tokens
- ✅ No unexpected errors

---

## Test 10: User Acceptance Test

### Happy Path
1. User registers → ✅ Success message
2. User receives email → ✅ Within 30 seconds
3. User clicks link → ✅ Success page with green checkmark
4. User logs in → ✅ Dashboard loads
5. User uses app → ✅ Full functionality available

### Error Cases
1. User clicks expired link → ❌ Graceful error message
2. User clicks link twice → ⚠️ "Already verified" message
3. User enters wrong credentials → ❌ Login error (expected)

---

## Success Criteria

All tests should:
- [ ] Return expected HTTP status codes
- [ ] Return proper JSON responses
- [ ] Not throw 500 errors
- [ ] Update database correctly
- [ ] Show correct UI states
- [ ] Handle edge cases gracefully
- [ ] Not have security vulnerabilities
- [ ] Process requests in < 500ms

---

## Automated Test Suite (Future)

Create `/tests/e2e/email-verification.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Email Verification Flow', () => {
  test('should verify email successfully', async ({ page }) => {
    // Register user
    await page.goto('/register');
    await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'TestPass123!');
    await page.fill('[name="name"]', 'Test User');
    await page.click('button[type="submit"]');

    // Wait for success
    await expect(page.locator('text=erfolgreich registriert')).toBeVisible();

    // Get verification token from database
    // ... query database ...

    // Visit verification page
    await page.goto(`/verify-email/${token}`);

    // Check success state
    await expect(page.locator('text=Email bestätigt')).toBeVisible();
    await expect(page.locator('.text-green-600')).toBeVisible();

    // Verify no console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    expect(errors).toHaveLength(0);
  });

  test('should handle invalid token gracefully', async ({ page }) => {
    await page.goto('/verify-email/invalid-token-123');

    await expect(page.locator('text=Bestätigung fehlgeschlagen')).toBeVisible();
    await expect(page.locator('.text-red-600')).toBeVisible();
  });
});
```

---

## Deployment Verification Checklist

Before marking as complete:
- [ ] All manual tests pass
- [ ] Production deployment successful
- [ ] Vercel logs show no errors
- [ ] Test registration completes successfully
- [ ] Test email verification works end-to-end
- [ ] Database updates correctly
- [ ] No 500 errors in console
- [ ] User can log in after verification

**STATUS**: Ready for production testing after deployment ✅
