# Klassenbuch App - Verhaltenssteuerung für Schulen

[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](./VERSION.md)
[![Next.js](https://img.shields.io/badge/Next.js-13.5.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

## 📚 Über das Projekt

Die Klassenbuch App ist eine moderne, DSGVO-konforme WebApp zur fairen und transparenten Verhaltenssteuerung im Klassenzimmer. Sie nutzt Gamification-Elemente, um positives Verhalten zu fördern und Lehrkräften ein effektives Tool für Klassenmanagement zu bieten.

### 🎯 Kernfunktionen

- **Live-Verhaltenssteuerung**: Echtzeit-Tracking mit Farbsystem (Blau/Grün/Gelb/Rot)
- **XP & Level-System**: Motivierendes Punktesystem mit konfigurierbaren Levels
- **Belohnungen & Konsequenzen**: Verwaltung und Einlösung von Rewards
- **Tafelmodus**: Optimiert für Beamer/Smartboard-Projektion
- **Reports & Analytics**: Detaillierte Auswertungen und PDF-Export
- **DSGVO-konform**: Minimale Datenspeicherung, nur Vornamen

## 🚀 Quick Start

### Voraussetzungen

- Node.js 18+ 
- Docker & Docker Compose (für lokale Datenbank)
- PostgreSQL (alternativ zu Docker)

### Installation

```bash
# Repository klonen
git clone https://github.com/cubetribe/klassenbuch_APP.git
cd klassenbuch_APP/frontend_bolt

# Dependencies installieren
npm install

# Umgebungsvariablen konfigurieren
cp .env.local.example .env.local
# .env.local mit eigenen Werten befüllen

# Datenbank starten (Docker)
docker-compose up -d

# Prisma Setup
npx prisma generate
npx prisma migrate dev

# Development Server starten
npm run dev
```

Die App ist nun unter [http://localhost:3000](http://localhost:3000) erreichbar.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 13.5.1 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Realtime**: Server-Sent Events (SSE)
- **Charts**: Recharts
- **PDF**: @react-pdf/renderer

### Backend
- **API**: Next.js API Routes
- **Authentication**: NextAuth.js v4
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Security**: bcryptjs, JWT

### Deployment
- **Platform**: Vercel (EU-Region)
- **Database**: PostgreSQL (Docker/Neon)
- **Storage**: Vercel Blob
- **Cache**: Vercel KV

## 📁 Projektstruktur

```
frontend_bolt/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth Layout
│   ├── (dashboard)/       # Dashboard Layout
│   └── api/               # API Routes
├── components/            # React Components
│   ├── ui/               # shadcn/ui Components
│   ├── layout/           # Layout Components
│   └── ...
├── lib/                   # Utilities & Logic
│   ├── api/              # API Helpers
│   ├── auth/             # Auth Configuration
│   ├── db/               # Database Client
│   ├── validations/      # Zod Schemas
│   └── utils/            # Helper Functions
├── prisma/               # Database Schema
├── public/               # Static Assets
└── types/                # TypeScript Types
```

## 🔐 Sicherheit & Datenschutz

- **DSGVO-konform**: Nur Vornamen, minimale Datenspeicherung
- **Verschlüsselung**: Passwörter mit bcrypt, sensible Daten verschlüsselt
- **Session Management**: httpOnly Cookies, JWT
- **Audit Logging**: Alle Aktionen werden protokolliert
- **EU-Hosting**: Daten bleiben in der EU

## 📊 Features Status

| Feature | Status | Version |
|---------|--------|---------|
| Authentication | ✅ Implementiert | v0.0.1 |
| Course Management | ✅ Implementiert | v0.0.1 |
| Student Management | 🔄 In Arbeit | v0.0.2 |
| Behavior Tracking | 🔄 In Arbeit | v0.0.2 |
| Real-time Updates | ⏳ Geplant | v0.0.3 |
| Reports & Export | ⏳ Geplant | v0.0.3 |
| Rewards System | ⏳ Geplant | v0.0.4 |
| Auto-Rules | ⏳ Geplant | v0.0.5 |

## 🧪 Testing

```bash
# Unit Tests
npm run test

# E2E Tests
npm run test:e2e

# Type Checking
npm run type-check

# Linting
npm run lint
```

## 📝 API Dokumentation

Die vollständige API-Dokumentation findest du unter [/docs/api](./docs/api/README.md).

### Beispiel-Endpoints

```typescript
// Authentication
POST   /api/auth/register
POST   /api/auth/[...nextauth]

// Courses
GET    /api/courses
POST   /api/courses
GET    /api/courses/[id]
PATCH  /api/courses/[id]
DELETE /api/courses/[id]

// Students
GET    /api/courses/[id]/students
POST   /api/students
PATCH  /api/students/[id]
```

## 🤝 Contributing

Beiträge sind willkommen! Bitte lies [CONTRIBUTING.md](./CONTRIBUTING.md) für Details.

1. Fork das Projekt
2. Erstelle einen Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Committe deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe [LICENSE](./LICENSE) für Details.

## 👥 Team

- **Dennis Westermann** - Projektleitung & Development
- **CubeTribe** - Development Team

## 📞 Support

Bei Fragen oder Problemen:
- 📧 Email: support@cubetribe.com
- 🐛 Issues: [GitHub Issues](https://github.com/cubetribe/klassenbuch_APP/issues)
- 📖 Docs: [Dokumentation](./docs/README.md)

## 🙏 Danksagung

- [Next.js](https://nextjs.org/) Team
- [shadcn/ui](https://ui.shadcn.com/) für die UI-Komponenten
- [Vercel](https://vercel.com/) für das Hosting
- Allen Contributors und Testern

---

**Made with ❤️ by CubeTribe**