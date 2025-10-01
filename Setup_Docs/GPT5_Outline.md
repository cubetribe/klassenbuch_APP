Produkt-Ziel

Web‑App zur sichtbaren, fairen Verhaltenssteuerung mit Farbstatus + Level‑Logik, Belohnungen/Konsequenzen, alles konfigurierbar pro Kurs. Keine Noten, reine Sozialverhaltenssteuerung. Nur online (Browser).

Nutzer & Rollen
	•	Lehrer (Owner): verwaltet alles.
	•	(Optional) Co‑Teacher/Viewer: Leserechte/Live‑Anzeige.
	•	(Optional, später) Schüler‑Ansicht: kein Bestandteil des MVP.

Kernfunktionen (MVP)
	1.	Kurs-Management
	•	Kurse anlegen/archivieren (Name, Fach, Schuljahr).
	•	Schülerliste pro Kurs (Vorname, interne ID).
	•	CSV‑Import/Export.
	2.	Live-Unterricht
	•	Kurs‑Dashboard mit Schüler‑Kacheln (Farbe + Level).
	•	1‑Tap Farbwechsel (Quick‑Actions: +/‑Level/XP, Verwarnung, Konsequenz).
	•	Tafelmodus (Beamer): große Kacheln, optional nur Initialen.
	3.	Verhaltenslogik (voll konfigurierbar)
	•	Farben: Blau/Grün/Gelb/Rot (Labels/Icons änderbar).
	•	Level/XP:
	•	Option A: feste Level (z. B. 0/5/10/20).
	•	Option B: XP‑Punkte mit Schwellen pro Farbe.
	•	Actions (konfigurierbar): Button‑Set mit Effekten (±XP, Farbe setzen), Cooldowns, Kommentarpflicht optional.
	•	Auto‑Regeln (optional): z. B. „nach X Min ohne negatives Event +1 XP“, „max. 1× Blau‑Aufstieg pro Stunde“.
	4.	Belohnungen & Konsequenzen
	•	Reward‑Katalog (Name, Kosten in Level/XP, Wochenlimit).
	•	Einlösen mit Historie/Undo.
	•	Konsequenzen‑Katalog (Textlabel, Notizpflicht ja/nein).
	5.	Reports (on demand, kein Generator für Elternbriefe)
	•	Schüler‑Report: filterbar (z. B. letzte 3 Monate, Schüler‑ID), Verlauf/Events/Rewards.
	•	Kurs‑Report: Verteilung Farben, Trendlinien (Zeitraum wählbar).
	•	Export: PDF/CSV auf Knopfdruck.
	•	Kein Elternbrief‑Generator, keine KI‑Features.

Nicht‑funktionale Anforderungen
	•	Performance: Tap→Feedback ideal <150 ms, hart <300 ms.
	•	Sicherheit: E‑Mail/Passwort‑Login, httpOnly‑Cookies, CSRF, RBAC (Owner/Viewer).
	•	Datenschutz: nur Vorname + interne Schüler‑ID; keine PII in Logs; EU‑Regionen (Vercel Functions + Railway Service/DB).
	•	Auditability: Events sind append‑only; Undo erzeugt Gegen‑Event (lückenloser Verlauf).
	•	Barrierefreiheit/Usability: große Touch‑Targets, hoher Kontrast im Tafelmodus.

Architektur (High Level)
	•	Frontend (Vercel, EU‑Region): Next.js (App Router), Route Handlers/Server Actions, Tafelmodus als Public‑Route ohne PII (nur Initialen/IDs).
	•	Backend (Railway, EU‑Region): Node (Express/Fastify) oder Next‑APIs – je nach Präferenz; zentrale Event‑Write‑API.
	•	Datenbank (Railway Postgres, EU‑Region): relational; Migrations via Prisma/Drizzle.
	•	PDF‑Service: serverseitiges Rendering (Puppeteer/Playwright) im Backend.
	•	Logging/Monitoring: strukturierte Logs ohne PII, Error‑Tracking ohne Payloads.

Datenmodell (vereinfachter Entwurf)
	•	teachers: id, email, password_hash, name, role
	•	courses: id, teacher_id, name, subject, school_year, settings_json
	•	students: id, course_id, display_name (Vorname), internal_code (zufällig), active
	•	behavior_states: id, student_id, color (enum), level/int_xp, updated_at
	•	events: id, student_id, course_id, type (enum: action|reward|consequence|system), payload_json, created_at, created_by
	•	rewards: id, course_id, name, cost_xp_or_level, weekly_limit, active
	•	consequences: id, course_id, name, notes_required (bool), active
	•	redemptions: id, reward_id, student_id, course_id, created_at, created_by
	•	reports: id, course_id, scope (student|course), period_start, period_end, metrics_json, pdf_url

settings_json pro Kurs: Farb‑Labels/Reihenfolge, Level/XP‑Schwellen, Auto‑Regeln, Buttons/Aktionen, Cooldowns, Tafelmodus‑Optionen, Export‑Felder, Löschfristen.

Konfiguration (was einstellbar ist)
	•	Farben & Labels (Namen, Reihenfolge).
	•	Level/XP‑Schema (Startwert, Max/Min, Schwellen je Farbe).
	•	Actions (Buttons, Effekte, Cooldowns, Kommentarpflicht).
	•	Auto‑Regeln (zeitbasierte Auf-/Abstiege, Deckelungen).
	•	Belohnungen/Konsequenzen (Katalog, Kosten/Limits, Notizpflicht).
	•	Tafelmodus (Namen vs. Initialen, Sortierung: Level/Name/zuletzt geändert, Vollbild).
	•	Reports/Exporte (Zeiträume, Metriken, Anonymisierung).
	•	Datenschutz (Anonymisierungstermin, z. B. Ende Schuljahr; CSV‑Felder).

Haupt‑Userflows
	1.	Onboarding: Account → ersten Kurs → Schülerliste importieren → Level/XP‑Preset wählen → Tafelmodus testen.
	2.	Unterricht (Live): Kurs öffnen → Kacheln → Quick‑Actions (±XP, Gelb/Rot, Reward einlösen) → sofortiges UI‑Feedback.
	3.	Auswertung (on demand): Zeitraum/Schüler wählen → Report generieren → PDF/CSV exportieren.

API‑Outline (Überblick)
	•	POST /auth/signup|login|logout
	•	GET /courses · POST /courses · PATCH /courses/:id
	•	GET /courses/:id/students · POST /courses/:id/students · PATCH /students/:id
	•	GET /state?course_id=… (aktueller Zustand batched)
	•	POST /events (eine Aktion auf einen Schüler, inkl. Effektberechnung)
	•	GET /reports/course?course_id=…&from=…&to=…
	•	GET /reports/student?student_id=…&from=…&to=…
	•	GET/POST /rewards · POST /redeem
	•	GET/POST /consequences
	•	GET /export/:course_id.(csv|pdf)

	Qualitäts‑/Abnahmekriterien (MVP)
	•	1‑Tap Farbwechsel <300 ms sichtbar (optimistic update + server confirmation).
	•	Kein Klarname in Logs/Analytics; Cookies httpOnly; CSRF aktiv.
	•	Reports für „letzte 3 Monate“ pro Schüler‑ID und pro Kurs generierbar; PDF/CSV‑Export funktioniert.
	•	Einstellungen wirken sofort (ohne Neustart/Deploy).
	•	Compute & DB in EU‑Regionen konfiguriert.