# 📚 Klassenbuch App - Digitale Verhaltenssteuerung für Schulen

![Version](https://img.shields.io/badge/version-0.8.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-13.5.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-Beta-yellow)

Eine moderne, DSGVO-konforme WebApp zur digitalen Verhaltenssteuerung im Klassenzimmer mit Gamification-Elementen. Entwickelt für deutsche Schulen mit Fokus auf Datenschutz und pädagogische Wirksamkeit.

## 🎯 Features

### ✅ Implementiert (v0.8.0)
- **🔐 Authentifizierung**: Sicheres Login-System mit Session-Management
- **📚 Kursverwaltung**: Vollständige CRUD-Operationen für Kurse
- **👥 Schülerverwaltung**: Anonyme Schülerprofile (nur Vornamen)
- **🎮 Gamification**: XP-System, Level, Farbcodierung
- **🏆 Belohnungssystem**: Rewards mit Einlöse-Limits
- **⚠️ Konsequenzen**: Strukturiertes Konsequenzen-Management
- **📊 Reports**: Detaillierte Berichte mit CSV-Export
- **🖥️ Tafelmodus**: Beamer-optimierte Ansicht
- **🎯 Live-Unterricht**: Echtzeit-Verhaltenssteuerung
- **🌓 Dark Mode**: Augenschonender Nachtmodus
- **📱 Responsive**: Mobile-first Design

### 🚧 In Entwicklung
- **📄 PDF-Export**: Berichte als PDF
- **🔄 Echtzeit-Sync**: Server-Sent Events (SSE)
- **💾 Cloud-Backup**: Automatische Datensicherung
- **📸 Avatar-Upload**: Profilbilder für Schüler

## 🚀 Quick Start

### Voraussetzungen
- Node.js 18+ 
- Docker (für lokale Datenbank)
- Git

### Installation

```bash
# Repository klonen
git clone https://github.com/cubetribe/klassenbuch_APP.git
cd klassenbuch_APP/frontend_bolt

# Dependencies installieren
npm install

# Umgebungsvariablen einrichten
cp .env.local.example .env.local

# Datenbank starten (Docker)
docker-compose up -d

# Prisma Setup
npx prisma generate
npx prisma migrate dev

# Entwicklungsserver starten
npm run dev
```

Die App läuft auf [http://localhost:3000](http://localhost:3000)

### Demo-Login
```
Email: teacher@school.com
Passwort: demo123
```

## 🏗️ Technologie-Stack

### Frontend
- **Framework**: Next.js 13.5.1 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide Icons

### Backend
- **API**: Next.js API Routes
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: NextAuth.js v4
- **Validation**: Zod

### DevOps
- **Hosting**: Vercel (geplant)
- **Database**: Vercel Postgres (Production)
- **Monitoring**: Vercel Analytics
- **CI/CD**: GitHub Actions

## 📁 Projektstruktur

```
frontend_bolt/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth Pages (Login, Register)
│   ├── (dashboard)/       # Dashboard Pages
│   ├── api/               # API Routes
│   └── layout.tsx         # Root Layout
├── components/            # React Components
│   ├── ui/               # shadcn/ui Components
│   ├── layout/           # Layout Components
│   └── ...               # Feature Components
├── lib/                   # Utilities & Configs
│   ├── auth/             # Auth Configuration
│   ├── stores/           # Zustand Stores
│   └── utils/            # Helper Functions
├── prisma/               # Database Schema
└── public/               # Static Assets
```

## 🔒 Datenschutz & DSGVO

Die App wurde speziell für deutsche Schulen entwickelt und erfüllt strenge Datenschutzanforderungen:

- ✅ **Minimale Datenspeicherung**: Nur Vornamen, keine Nachnamen
- ✅ **Anonyme IDs**: Interne Schüler-Codes statt Klarnamen
- ✅ **Lokale Datenhaltung**: Daten verlassen nicht die Schule
- ✅ **Audit-Logs**: Vollständige Nachverfolgbarkeit
- ✅ **Daten-Export**: DSGVO-konforme Datenauskunft
- ✅ **Löschfunktion**: Vollständige Datenlöschung möglich

## 📊 Entwicklungsstatus

### Version 0.8.0 (Aktuell)
- ✅ Vollständige Frontend-Backend Integration
- ✅ Alle Core-Features implementiert
- ✅ Demo-Login für Testing
- ✅ UI/UX poliert und responsive
- ✅ Null-Safety in allen Components

### Roadmap zu v1.0
- [ ] Production Database Setup (Vercel Postgres)
- [ ] Performance Optimierung
- [ ] E2E Tests mit Playwright
- [ ] Vollständige Dokumentation
- [ ] Security Audit

## 🛠️ Entwicklung

### Verfügbare Scripts

```bash
npm run dev        # Entwicklungsserver
npm run build      # Production Build
npm run start      # Production Server
npm run lint       # ESLint
npm run db:studio  # Prisma Studio
npm run db:push    # Database Push
npm run db:seed    # Seed Database
```

### Environment Variables

Erstelle eine `.env.local` Datei:

```env
# Database (Local)
DATABASE_URL="postgresql://postgres:password@localhost:5432/klassenbuch"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Production (Vercel)
POSTGRES_URL=""
POSTGRES_PRISMA_URL=""
POSTGRES_URL_NON_POOLING=""
```

## 🧪 Testing

```bash
# Unit Tests (coming soon)
npm run test

# E2E Tests (coming soon)  
npm run test:e2e

# Type Checking
npm run type-check
```

## 📝 API Dokumentation

Die App bietet eine RESTful API mit folgenden Hauptendpoints:

- `/api/auth/*` - Authentifizierung
- `/api/courses/*` - Kursverwaltung
- `/api/students/*` - Schülerverwaltung  
- `/api/events/*` - Verhaltensereignisse
- `/api/rewards/*` - Belohnungen
- `/api/consequences/*` - Konsequenzen
- `/api/reports/*` - Berichte

Detaillierte API-Docs: [/docs/api.md](./docs/api.md) (coming soon)

## 🤝 Contributing

Beiträge sind willkommen! Bitte beachte:

1. Fork das Repository
2. Erstelle einen Feature Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Öffne einen Pull Request

## 📄 Lizenz

Copyright © 2025 Dennis Westermann / aiEX Academy

## 👥 Team

- **Dennis Westermann / aiEX Academy** - Projektleitung & Entwicklung
- **Claude (AI)** - Entwicklungsunterstützung

## 📞 Support

Bei Fragen oder Problemen:
- 📧 Email: support@klassenbuch-app.de (coming soon)
- 🐛 Issues: [GitHub Issues](https://github.com/cubetribe/klassenbuch_APP/issues)
- 📖 Docs: [Dokumentation](./docs/) (in Arbeit)

## 🙏 Danksagungen

- [Next.js](https://nextjs.org/) - Das React Framework
- [Vercel](https://vercel.com/) - Hosting & Deployment
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Prisma](https://www.prisma.io/) - Database ORM

---

**Made with ❤️ for German Schools**

*Entwickelt mit Unterstützung von Claude AI (Anthropic)*