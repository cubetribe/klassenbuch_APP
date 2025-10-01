# Email Authentication Implementation
## Multi-Agent Task Distribution

**Start:** 2025-10-01
**Project:** Klassenbuch App v0.9.4 → v0.10.0
**Feature:** Production-Ready Email Authentication with Resend

---

## 🎯 Mission Overview

Implementierung eines professionellen Email-basierten Authentifizierungssystems:
- ✅ Email-Verification bei Registrierung (PFLICHT)
- ✅ Password-Reset via Email
- ✅ Resend Integration (Vercel-empfohlen)
- ✅ Production-Ready ohne lokale Tests
- ✅ Fallback auf alte Login-Routes

---

## 🤖 Agent Distribution

### Agent 1: Database Agent
**Task:** Prisma Schema erweitern + Migration
**Output:** `database/REPORT.md`
**Verantwortlich für:**
- User Model erweitern (emailVerified, verificationToken, resetToken, etc.)
- Migration erstellen
- Migration auf Railway ausführen
- Admin-User Seed-Script

### Agent 2: Backend Agent
**Task:** API Endpoints + Email Service
**Output:** `backend/REPORT.md`
**Verantwortlich für:**
- Resend Integration Setup
- Email Service Library (`lib/email/service.ts`)
- 4 neue API Endpoints (verify, resend, request-reset, reset-password)
- Token Utils
- NextAuth Config erweitern

### Agent 3: Frontend Agent
**Task:** UI Pages + User Flows
**Output:** `frontend/REPORT.md`
**Verantwortlich für:**
- Register Page aktivieren
- Email Verification Page (`/verify-email/[token]`)
- Password Reset Flow (Request + Confirm Pages)
- Login Page erweitern (Error Handling)
- Success/Error States

---

## 📋 Coordination

**Orchestrator:** Claude (Main)
**Strategy:** Sequential mit Dependencies
1. Database Agent startet zuerst (alle hängen davon ab)
2. Backend + Frontend Agents parallel nach DB-Completion
3. Main Claude koordiniert Testing + Integration

---

## 📊 Progress Tracking

- [ ] Agent 1 (Database) - Status: Pending
- [ ] Agent 2 (Backend) - Status: Pending
- [ ] Agent 3 (Frontend) - Status: Pending
- [ ] Integration Testing - Status: Pending
- [ ] Production Deployment - Status: Pending

---

## 🔗 Links

- **Main Plan:** `/ADMIN_TODO_DNS_SETUP.txt` (für Admin)
- **Technical Spec:** In diesem README (für Agents)
- **Production URL:** https://klassenbuch-app.vercel.app/
- **Database:** Railway PostgreSQL
- **Email Service:** Resend (onboarding@resend.dev → später mail@goaiex.com)

---

**Last Updated:** 2025-10-01
