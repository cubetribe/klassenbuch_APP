# Email Authentication Setup

This directory contains the email service implementation for the Klassenbuch App authentication system.

## Overview

The email service uses [Resend](https://resend.com) to send transactional emails for:
- Email verification after registration
- Password reset requests

## Required Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Resend API Configuration
RESEND_API_KEY=your_resend_api_key_here

# Email From Address (defaults to onboarding@resend.dev if not set)
EMAIL_FROM=onboarding@resend.dev

# Application URL (used in email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Getting Your Resend API Key

1. Sign up for a free account at [resend.com](https://resend.com)
2. Navigate to API Keys in your dashboard
3. Create a new API key
4. Copy the key and add it to your `.env.local` file

### Email From Address

For development and testing, you can use Resend's test address:
```
EMAIL_FROM=onboarding@resend.dev
```

For production, you should:
1. Add and verify your domain in Resend
2. Use an email address from your verified domain (e.g., `noreply@yourdomain.com`)

### Application URL

Set this to your application's base URL:
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

This URL is used to construct verification and password reset links in emails.

## Email Templates

The service includes two email templates:

### 1. Verification Email
- **Subject:** "Verify your email - Klassenbuch App"
- **Sent:** After user registration
- **Token Expiry:** 24 hours
- **Contains:** Verification link with token

### 2. Password Reset Email
- **Subject:** "Reset your password - Klassenbuch App"
- **Sent:** When user requests password reset
- **Token Expiry:** 1 hour (for security)
- **Contains:** Password reset link with token

## API Endpoints

The following authentication endpoints are available:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/register` | POST | Register new user (sends verification email) |
| `/api/auth/verify-email` | POST | Verify email with token |
| `/api/auth/resend-verification` | POST | Resend verification email |
| `/api/auth/request-reset` | POST | Request password reset (sends reset email) |
| `/api/auth/reset-password` | POST | Reset password with token |

## Security Features

### Email Verification
- Users cannot log in until their email is verified
- Verification tokens are cryptographically secure (32 bytes)
- Tokens are stored hashed in the database
- Tokens expire after 24 hours

### Password Reset
- Reset tokens expire after 1 hour
- Token validation includes expiry check
- No user enumeration: always returns success (even if email doesn't exist)
- Old tokens are cleared after successful password reset

### Best Practices Implemented
- No sensitive information exposed in error messages
- Rate limiting recommended for production
- Tokens are single-use (cleared after use)
- Proper error logging without exposing details to users

## Testing

### Local Development Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test registration:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "SecurePass123",
       "name": "Test User"
     }'
   ```

3. Check your email for the verification link (or check Resend dashboard for test emails)

4. Test verification:
   ```bash
   curl -X POST http://localhost:3000/api/auth/verify-email \
     -H "Content-Type: application/json" \
     -d '{"token": "your_token_from_email"}'
   ```

### Using Resend Test Mode

Resend provides a test mode that captures emails without sending them. This is useful for development:
- All emails sent to `onboarding@resend.dev` are captured
- View them in your Resend dashboard under "Emails"
- No need to check actual email inboxes

## Troubleshooting

### Email Not Sending

1. **Check API Key**: Ensure `RESEND_API_KEY` is set correctly
2. **Check Logs**: Look for error messages in server console
3. **Verify Domain**: For production, ensure domain is verified in Resend
4. **Rate Limits**: Check if you've exceeded Resend's rate limits

### Email Not Received

1. **Check Spam Folder**: Sometimes verification emails end up in spam
2. **Check Resend Dashboard**: View email delivery status
3. **Verify Email Address**: Ensure the recipient email is valid
4. **Check Logs**: Look for `emailSent: false` in API responses

### Token Expired

1. **Verification Token**: Request a new one via `/api/auth/resend-verification`
2. **Reset Token**: Request a new password reset via `/api/auth/request-reset`

## Production Deployment

Before deploying to production:

1. Add all environment variables to your deployment platform (Vercel, Railway, etc.)
2. Use a verified domain for `EMAIL_FROM`
3. Set correct `NEXT_PUBLIC_APP_URL` for production
4. Consider implementing rate limiting on email endpoints
5. Monitor email delivery through Resend dashboard
6. Set up email delivery webhooks (optional, for advanced monitoring)

## Database Schema

The User model includes these email-related fields:

```prisma
model User {
  emailVerified     DateTime?  @map("email_verified")
  verificationToken String?    @unique @map("verification_token")
  resetToken        String?    @unique @map("reset_token")
  resetTokenExpiry  DateTime?  @map("reset_token_expiry")
}
```

Make sure to run database migrations before using the email authentication system:

```bash
npx prisma migrate dev
```

## Support

- Resend Documentation: https://resend.com/docs
- Resend Status: https://status.resend.com
- For issues with this implementation, contact the development team
