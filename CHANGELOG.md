# Changelog - Klassenbuch App

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.4] - 2025-10-01

### Added
- **Email Authentication System**: Complete email verification workflow for user registration
  - Email verification required before login
  - Password reset via email functionality
  - Custom domain email sending (mail@goaiex.com) via Resend
  - Verification token generation with 24-hour expiry
  - Password reset token with 1-hour expiry
  - Support page for user assistance

### Changed
- Updated registration flow: Users must verify email before first login
- Enhanced login error handling with specific messages for unverified emails
- Improved authentication security with email verification requirement

### Fixed
- **Email Verification URL Handling**: Fixed 500 error when clicking verification links
  - Added GET handler to verify-email API route (previously only POST)
  - Corrected URL structure from `/verify-email?token=` to `/verify-email/{token}` for dynamic routes
  - Added `.trim()` to environment variables to remove newlines (caused by Vercel CLI)
  - Extracted shared verification logic into `verifyEmailLogic()` function
- **SSE Route Build Error**: Added `export const dynamic = 'force-dynamic'` to prevent static generation of Server-Sent Events endpoint

### Technical Details
- **Database Schema**: Added email verification fields to User model
  - `emailVerified` (DateTime, nullable)
  - `verificationToken` (String, unique, nullable)
  - `resetToken` (String, unique, nullable)
  - `resetTokenExpiry` (DateTime, nullable)
- **API Routes**: 4 new authentication endpoints
  - `POST /api/auth/verify-email` - Verify email with token
  - `GET /api/auth/verify-email` - Verify email via link click
  - `POST /api/auth/resend-verification` - Resend verification email
  - `POST /api/auth/request-reset` - Request password reset
  - `POST /api/auth/reset-password` - Reset password with token
- **Email Service**: Resend integration with custom domain
  - Production email: mail@goaiex.com
  - Domain verified on Resend (eu-west-1 region)
  - Professional HTML email templates
- **Environment Variables**:
  - `RESEND_API_KEY` - API key for email sending
  - `EMAIL_FROM` - Sender email address
  - `NEXT_PUBLIC_APP_URL` - Base URL for verification links

### Known Issues & Solutions
- **Problem**: Environment variables with `\n` characters cause malformed URLs
  - **Solution**: All environment variables now use `.trim()` in code
  - **Prevention**: Use `printf` instead of `echo` when setting Vercel env vars
- **Problem**: Email verification links return 500 error
  - **Root Cause**: API route only supported POST, but email links send GET requests
  - **Solution**: Added GET handler that extracts token from query parameters

### Migration Notes
If upgrading from v0.9.3 or earlier:
1. Run database migration: `npx prisma migrate deploy`
2. Set environment variables in Vercel:
   - `RESEND_API_KEY`
   - `EMAIL_FROM`
   - `NEXT_PUBLIC_APP_URL`
3. Configure DNS records for custom domain email (MX, SPF, DKIM, DMARC)
4. Verify domain in Resend dashboard
5. Existing users will need to verify their email addresses

### Testing Checklist
- [x] User registration creates unverified account
- [x] Verification email sent from mail@goaiex.com
- [x] Email link verification works (GET request)
- [x] Frontend verification works (POST request)
- [x] Login blocked for unverified users
- [x] Password reset email delivery
- [x] Password reset token validation
- [x] Token expiry enforcement (24h verification, 1h reset)
- [x] Support page accessible
- [x] Multi-tenancy: Users see only their own courses/students

---

## [0.9.3] - 2025-08-15

### Fixed
- Multiple bugs on Klassenbuch reports page
- Critical database failure after rewards/consequences changes

### Changed
- Made rewards and consequences system-wide (shared between all users)

---

## [0.9.2] - 2025-08-14

### Added
- Complete UI/UX polish
- Emoji picker for rewards and consequences
- Production fixes for critical API endpoints

### Fixed
- Session management in production environment
- API endpoint stability

---

## [0.9.1] - 2025-08-13

### Added
- Complete UI/UX polish and production fixes

---

## [0.9.0] - 2025-08-12

### Added
- Initial production-ready release
- Full backend integration
- Course management (CRUD)
- Student management (CRUD + CSV import/export)
- Behavior event tracking
- Rewards & consequences system
- Real-time updates via SSE
- Dashboard with KPIs and activities

---

## Format Legend

### Types of Changes
- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` in case of vulnerabilities
