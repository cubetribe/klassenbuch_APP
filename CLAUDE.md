# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Version: 0.8.0 (Beta)**

This is a Next.js 13.5.1 application for classroom behavior management (Klassenbuch App), designed for German schools with strict GDPR compliance. The app tracks student behavior using a gamified color/XP system and is built with production-ready backend integration.

**Status**: Feature-complete, ready for Vercel deployment with demo authentication.

## Essential Commands

```bash
# Development
npm run dev                    # Start development server on http://localhost:3000
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint

# Database (PostgreSQL with Prisma)
docker-compose up -d           # Start local PostgreSQL database
npx prisma generate           # Generate Prisma Client
npx prisma migrate dev        # Run migrations in development
npx prisma migrate deploy     # Run migrations in production
npx prisma studio             # Open Prisma Studio for database inspection
npx prisma db seed           # Seed database with sample data (when implemented)

# Git & Deployment
git push origin main          # Deploy to GitHub (triggers Vercel deployment if configured)
```

## Architecture & Key Design Patterns

### Authentication Flow
The application uses **NextAuth.js v4** (not v5 due to Next.js 13.5.1 compatibility) with JWT strategy and httpOnly cookies. Authentication is handled through:
- `lib/auth/config.ts` - NextAuth configuration with Credentials provider
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API handler
- `middleware.ts` - Route protection and role-based access control
- Password hashing uses bcryptjs with configurable salt rounds

### Database Architecture
**Prisma ORM** with PostgreSQL following GDPR-compliant design:
- Only first names stored (`displayName` field)
- Anonymous student identifiers (`internalCode`)
- Event sourcing pattern for behavior tracking (append-only `BehaviorEvent` table)
- Soft deletes for courses (archived flag)
- Comprehensive audit logging for compliance

### API Design Pattern
All API routes follow consistent patterns:
1. Zod validation for request bodies
2. Session verification via getServerSession
3. Authorization checks (teacher owns resource or is admin)
4. Centralized error handling via `handleApiError`
5. Consistent response format

### State Management Architecture
- **Frontend**: Zustand store with persistence for UI state
- **Backend**: Event-driven architecture for behavior tracking
- **Real-time**: Server-Sent Events (SSE) planned for live updates (not WebSockets due to Vercel limitations)

### Mock Data Transition Strategy
Currently, the frontend uses mock data from `lib/mock-data.ts`. The backend APIs are ready but not yet integrated. When replacing mock data:
1. Update Zustand store actions to call API endpoints
2. Replace mock imports with API client calls
3. Add loading states and error handling
4. Implement optimistic updates for real-time feel

## Critical Configuration Notes

### Next.js Configuration Issue
**IMPORTANT**: The `next.config.js` currently has `output: 'export'` which disables API routes. This must be changed to enable the backend:
```javascript
// Remove or comment out this line for API routes to work:
// output: 'export',
```

### Environment Variables
The `.env.local` file contains sensitive configuration. Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` - Base URL for authentication callbacks

### Database Migrations
Always create migrations when changing the schema:
```bash
npx prisma migrate dev --name descriptive_migration_name
```

## Security Considerations for Educational Software

### GDPR Compliance
- No last names stored in database
- Minimal data retention policy
- Audit logs for all data access
- Student data uses anonymous identifiers
- Implement data export/deletion for GDPR requests

### Authentication Security
- Passwords hashed with bcryptjs
- JWT tokens in httpOnly cookies
- CSRF protection via NextAuth
- Rate limiting planned for production
- Role-based access control (Teacher, Co-Teacher, Admin)

## Current Implementation Status (v0.8.0)

### ✅ Completed (Backend + Frontend Integration)
- Complete database schema (Prisma) with 11 tables
- Full authentication system (NextAuth.js v4 with JWT)
- All 32 API endpoints implemented
- Course management (CRUD + settings)
- Student management (CRUD + CSV import/export)
- Behavior event tracking (event-sourcing)
- Rewards & consequences system (complete)
- Real-time updates (SSE infrastructure)
- Frontend-backend integration (all components)
- API client library with retry & deduplication
- Zustand store with backend integration
- SSE integration with auto-reconnect
- Error handling & loading states
- Integration test suite

### ⚠️ Requires Setup
- PostgreSQL database (Docker not running)
- Database migrations (npx prisma migrate dev)
- Production environment variables

### ⏳ Not Yet Implemented
- PDF report generation (@react-pdf/renderer)
- Avatar upload system (Vercel Blob)
- Auto-rules engine
- Caching with Vercel KV
- E2E tests with Playwright

## Known Issues & Limitations

1. **Database Connection**: PostgreSQL must be running via Docker
2. **Migrations Required**: Database migrations not yet run
3. **No PDF Export**: PDF generation not implemented
4. **No Avatar Upload**: Avatar upload system not implemented
5. **No Production Tests**: E2E tests not configured

## Development Workflow

When implementing new features:
1. Update Prisma schema if needed
2. Create/update validation schemas in `lib/validations/`
3. Implement API route with proper error handling
4. Update types in `types/index.ts`
5. Test with Prisma Studio or API client
6. Document progress in `.kiro/specs/backend-integration/tasks.md`

## File Organization Conventions

- **API Routes**: `app/api/[resource]/route.ts` for collections, `app/api/[resource]/[id]/route.ts` for individual items
- **Validation**: `lib/validations/[domain].ts` using Zod schemas
- **Database**: All Prisma operations through `lib/db/prisma.ts`
- **Authentication**: Auth-related utilities in `lib/auth/`
- **Utilities**: Shared utilities in `lib/utils/`

## Performance Considerations

- Database queries use proper indexes (defined in Prisma schema)
- Connection pooling configured for serverless environment
- Planned caching strategy using Vercel KV
- Pagination for large datasets
- Optimistic UI updates for real-time feel