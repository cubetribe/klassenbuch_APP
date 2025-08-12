# 🚀 Quick Start Guide - Klassenbuch App

## ✅ Aktueller Status
Die App ist **vollständig funktionsfähig** mit echter Datenbank und Backend!

### Was funktioniert:
- ✅ PostgreSQL Datenbank läuft in Docker
- ✅ Alle 32 API-Endpoints sind implementiert
- ✅ Frontend ist mit Backend integriert
- ✅ Testdaten sind eingefügt
- ✅ Login mit Demo-Account funktioniert

## 🎯 App starten (3 Schritte)

### 1. Datenbank starten (falls gestoppt)
```bash
docker-compose up -d
```

### 2. Development Server starten
```bash
npm run dev
```

### 3. Browser öffnen
```
http://localhost:3000
```

## 👤 Demo-Login
- **Email:** teacher@school.com
- **Passwort:** demo123

## 📝 Testdaten
Die Datenbank enthält bereits:
- 1 Lehrer-Account (Demo-Login)
- 1 Klasse (5a - Mathematik)
- 15 Schüler mit verschiedenen XP/Level
- 3 Belohnungen
- 3 Konsequenzen
- 5 Beispiel-Events

## 🔧 Nützliche Befehle

### Datenbank-Management
```bash
# Datenbank-UI öffnen (Prisma Studio)
npm run db:studio

# Datenbank zurücksetzen und neu füllen
npm run db:seed

# Schema-Änderungen anwenden
npm run db:push
```

### Troubleshooting
```bash
# Docker Status prüfen
docker ps

# Logs anzeigen
docker logs klassenbuch-db

# Lokalen PostgreSQL stoppen (falls Konflikt)
brew services stop postgresql
```

## 🎨 Features zum Testen

1. **Login**: Mit Demo-Account einloggen
2. **Kurse**: Kurs "Klasse 5a" ist bereits erstellt
3. **Schüler**: 15 Schüler mit verschiedenen Farben/XP
4. **Live Teaching**: Quick Actions funktionieren
5. **Belohnungen**: Können eingelöst werden
6. **Konsequenzen**: Können angewendet werden
7. **Reports**: Zeigen echte Daten

## ⚡ Performance
- Server startet in ~2 Sekunden
- Hot-Reload funktioniert
- Datenbank-Queries sind optimiert
- SSE für Real-time Updates bereit

## 🐛 Bekannte Einschränkungen
- PDF-Export noch nicht implementiert
- Avatar-Upload noch nicht fertig
- E-Mail-Versand nicht konfiguriert

## 🎉 Die App ist bereit für Testing!

Bei Fragen oder Problemen:
1. Server neu starten: `Ctrl+C` dann `npm run dev`
2. Docker prüfen: `docker ps`
3. Datenbank zurücksetzen: `npm run db:seed`

---
**Version:** v0.2.0 | **Status:** Beta | **Letzte Aktualisierung:** 2025-08-12