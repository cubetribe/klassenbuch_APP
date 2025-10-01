# Email Authentication User Flows

## Visual Flow Diagrams

### 1. Registration & Verification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     REGISTRATION FLOW                            │
└─────────────────────────────────────────────────────────────────┘

User Action                  Frontend Page              Backend API
────────────                ──────────────              ───────────

Visit app
    │
    ├─> /register           [Registration Form]
    │                       ┌──────────────────┐
    │                       │ • Name           │
    │                       │ • Email          │
    │                       │ • Password       │
    │                       │ • Confirm Pass   │
    │                       │ • Role Selector  │
    │                       └──────────────────┘
    │
    ├─> Submit form                              ──> POST /api/auth/register
    │                                                 { name, email, password, role }
    │
    ├─< Success Response                         <── { success: true }
    │                                                 Triggers verification email
    │
    ├─> [Success Screen]
    │   ┌──────────────────────────────────────┐
    │   │ ✅ Registrierung erfolgreich!        │
    │   │                                      │
    │   │ Email an user@example.com gesendet  │
    │   │                                      │
    │   │ [Zurück zum Login]                   │
    │   └──────────────────────────────────────┘
    │
    ├─> Check Email Inbox
    │   ┌──────────────────────────────────────┐
    │   │ Subject: Email bestätigen            │
    │   │                                      │
    │   │ Klicken Sie auf den Link:            │
    │   │ https://app.com/verify-email/{token} │
    │   └──────────────────────────────────────┘
    │
    ├─> Click Verification Link
    │
    ├─> /verify-email/abc123  [Verifying...]     ──> POST /api/auth/verify-email
    │                         ┌──────────────┐        ?token=abc123
    │                         │  Loading...  │
    │                         └──────────────┘
    │
    ├─< Success Response                         <── { success: true }
    │                                                 User activated in DB
    │
    ├─> [Success Screen]
    │   ┌──────────────────────────────────────┐
    │   │ ✅ Email bestätigt!                  │
    │   │                                      │
    │   │ Weiterleitung in 3 Sekunden...       │
    │   │                                      │
    │   │ [Jetzt anmelden]                     │
    │   └──────────────────────────────────────┘
    │
    └─> Auto-redirect to /login (after 3s)
        ┌──────────────────────────────────────┐
        │ [Login Page]                         │
        │ • Email: user@example.com            │
        │ • Password: ********                 │
        │ [Anmelden]                           │
        └──────────────────────────────────────┘
```

---

### 2. Password Reset Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PASSWORD RESET FLOW                           │
└─────────────────────────────────────────────────────────────────┘

User Action                  Frontend Page              Backend API
────────────                ──────────────              ───────────

/login
    │
    ├─> Click "Passwort vergessen?"
    │
    ├─> /reset-password      [Request Reset]
    │                        ┌──────────────────┐
    │                        │ Email:           │
    │                        │ [____________]   │
    │                        │                  │
    │                        │ [Email senden]   │
    │                        └──────────────────┘
    │
    ├─> Submit email                             ──> POST /api/auth/request-reset
    │                                                 { email: "user@example.com" }
    │
    ├─< Success Response                         <── { success: true }
    │                                                 Triggers reset email
    │
    ├─> [Success Screen]
    │   ┌──────────────────────────────────────┐
    │   │ ✅ Email versendet!                  │
    │   │                                      │
    │   │ Link gültig für 1 Stunde             │
    │   │                                      │
    │   │ [Zurück zum Login]                   │
    │   └──────────────────────────────────────┘
    │
    ├─> Check Email Inbox
    │   ┌──────────────────────────────────────┐
    │   │ Subject: Passwort zurücksetzen       │
    │   │                                      │
    │   │ Klicken Sie auf den Link:            │
    │   │ https://app.com/reset-password/xyz   │
    │   │                                      │
    │   │ Gültig für 1 Stunde                  │
    │   └──────────────────────────────────────┘
    │
    ├─> Click Reset Link
    │
    ├─> /reset-password/xyz789 [New Password]
    │                          ┌──────────────────────┐
    │                          │ Neues Passwort:      │
    │                          │ [________] 👁        │
    │                          │                      │
    │                          │ Passwort bestätigen: │
    │                          │ [________] 👁        │
    │                          │                      │
    │                          │ Requirements:        │
    │                          │ ✓ Min 8 Zeichen      │
    │                          │ ✓ Großbuchstaben     │
    │                          │ ✓ Kleinbuchstaben    │
    │                          │ ✓ Zahl               │
    │                          │                      │
    │                          │ [Passwort ändern]    │
    │                          └──────────────────────┘
    │
    ├─> Submit new password                      ──> POST /api/auth/reset-password
    │                                                 { token: "xyz789",
    │                                                   newPassword: "NewPass123" }
    │
    ├─< Success Response                         <── { success: true }
    │                                                 Password updated in DB
    │
    ├─> [Success Screen]
    │   ┌──────────────────────────────────────┐
    │   │ ✅ Passwort geändert!                │
    │   │                                      │
    │   │ Weiterleitung in 3 Sekunden...       │
    │   │                                      │
    │   │ [Jetzt anmelden]                     │
    │   └──────────────────────────────────────┘
    │
    └─> Auto-redirect to /login (after 3s)
```

---

### 3. Login with Unverified Email

```
┌─────────────────────────────────────────────────────────────────┐
│              LOGIN WITH UNVERIFIED EMAIL FLOW                    │
└─────────────────────────────────────────────────────────────────┘

User Action                  Frontend Page              Backend API
────────────                ──────────────              ───────────

/login
    │
    ├─> Enter credentials
    │   ┌──────────────────────────────────────┐
    │   │ Email: newuser@example.com           │
    │   │ Password: ********                   │
    │   │ [Anmelden]                           │
    │   └──────────────────────────────────────┘
    │
    ├─> Submit login                             ──> NextAuth signIn()
    │                                                 { email, password }
    │
    ├─< Error Response                           <── { error: "EMAIL_NOT_VERIFIED" }
    │                                                 User found but not verified
    │
    ├─> [Error Alert]
    │   ┌──────────────────────────────────────┐
    │   │ ⚠️ Bitte bestätigen Sie zuerst       │
    │   │    Ihre Email-Adresse                │
    │   │                                      │
    │   │ [📧 Email erneut senden]             │
    │   └──────────────────────────────────────┘
    │
    ├─> Click "Email erneut senden"
    │
    ├─> [Resend Dialog Opens]
    │   ┌──────────────────────────────────────┐
    │   │ Bestätigungs-Email erneut senden     │
    │   │                                      │
    │   │ Email:                               │
    │   │ [newuser@example.com]                │
    │   │                                      │
    │   │ [Abbrechen]  [Email senden]          │
    │   └──────────────────────────────────────┘
    │
    ├─> Click "Email senden"                     ──> POST /api/auth/resend-verification
    │                                                 { email: "newuser@example.com" }
    │
    ├─< Success Response                         <── { success: true }
    │                                                 New verification email sent
    │
    ├─> [Success in Dialog]
    │   ┌──────────────────────────────────────┐
    │   │ ✅ Email erfolgreich versendet!      │
    │   │                                      │
    │   │ Prüfen Sie Ihren Posteingang         │
    │   │                                      │
    │   │ [Schließen]                          │
    │   └──────────────────────────────────────┘
    │
    ├─> Close Dialog
    │
    ├─> Check Email → Click Link
    │
    └─> /verify-email/[token] → Success → Login
```

---

### 4. Resend Verification (Alternative Path)

```
┌─────────────────────────────────────────────────────────────────┐
│             RESEND VERIFICATION (STANDALONE)                     │
└─────────────────────────────────────────────────────────────────┘

User Action                  Frontend Page              Backend API
────────────                ──────────────              ───────────

/resend-verification
    │
    ├─> [Resend Form]
    │   ┌──────────────────────────────────────┐
    │   │ 📧 Bestätigungs-Email erneut senden  │
    │   │                                      │
    │   │ Email:                               │
    │   │ [____________________]               │
    │   │                                      │
    │   │ [Email senden]                       │
    │   │                                      │
    │   │ Zurück zum [Login]                   │
    │   └──────────────────────────────────────┘
    │
    ├─> Submit email                             ──> POST /api/auth/resend-verification
    │                                                 { email }
    │
    ├─< Success Response                         <── { success: true }
    │
    ├─> [Success Screen]
    │   ┌──────────────────────────────────────┐
    │   │ ✅ Email versendet!                  │
    │   │                                      │
    │   │ Prüfen Sie Spam-Ordner               │
    │   │                                      │
    │   │ [Zurück zum Login]                   │
    │   └──────────────────────────────────────┘
    │
    └─> Return to /login
```

---

### 5. Error Scenarios & Recovery

```
┌─────────────────────────────────────────────────────────────────┐
│                      ERROR HANDLING                              │
└─────────────────────────────────────────────────────────────────┘

ERROR: Expired Verification Token
─────────────────────────────────
/verify-email/expired-token
    │
    ├─> Token validation fails                   ──> POST /api/auth/verify-email
    │                                                 Returns: { error: "Token expired" }
    │
    ├─> [Error Screen]
    │   ┌──────────────────────────────────────┐
    │   │ ❌ Bestätigung fehlgeschlagen        │
    │   │                                      │
    │   │ Ungültiger oder abgelaufener Link    │
    │   │                                      │
    │   │ [Neuen Link anfordern]               │
    │   │ [Zurück zum Login]                   │
    │   └──────────────────────────────────────┘
    │
    └─> Click "Neuen Link anfordern" → /resend-verification


ERROR: Expired Reset Token
──────────────────────────
/reset-password/expired-token
    │
    ├─> Token validation fails                   ──> POST /api/auth/reset-password
    │                                                 Returns: { error: "Token expired" }
    │
    ├─> [Error Alert]
    │   ┌──────────────────────────────────────┐
    │   │ ❌ Link ungültig oder abgelaufen     │
    │   │                                      │
    │   │ [Neuen Reset-Link anfordern]         │
    │   └──────────────────────────────────────┘
    │
    └─> Click button → /reset-password (request new)


ERROR: Weak Password
────────────────────
/register OR /reset-password/[token]
    │
    ├─> User enters "pass"
    │
    ├─> Client-side validation catches it
    │   (before API call)
    │
    ├─> [Error Alert]
    │   ┌──────────────────────────────────────┐
    │   │ ❌ Passwort muss mindestens 8        │
    │   │    Zeichen lang sein                 │
    │   └──────────────────────────────────────┘
    │
    └─> User corrects → Resubmit


ERROR: Mismatched Passwords
───────────────────────────
/register OR /reset-password/[token]
    │
    ├─> Password: "MyPass123"
    │   Confirm:  "MyPass124"
    │
    ├─> Client-side validation catches it
    │
    ├─> [Error Alert]
    │   ┌──────────────────────────────────────┐
    │   │ ❌ Passwörter stimmen nicht überein  │
    │   └──────────────────────────────────────┘
    │
    └─> User corrects → Resubmit


ERROR: Email Already Exists
───────────────────────────
/register
    │
    ├─> Submit duplicate email                   ──> POST /api/auth/register
    │                                                 Returns: { error: "Email exists" }
    │
    ├─> [Error Alert]
    │   ┌──────────────────────────────────────┐
    │   │ ❌ Email bereits registriert         │
    │   │                                      │
    │   │ Zurück zum [Login]?                  │
    │   └──────────────────────────────────────┘
    │
    └─> User goes to /login
```

---

## Page State Transitions

### Registration Page States

```
┌─────────────┐
│   Initial   │
│   (Idle)    │
└──────┬──────┘
       │
       │ User fills form
       │
┌──────▼──────┐
│  Submitting │
│  (Loading)  │
└──────┬──────┘
       │
       ├─── Success ──▶ ┌─────────────┐
       │                │  Success    │
       │                │  Screen     │
       │                └─────────────┘
       │
       └─── Error ────▶ ┌─────────────┐
                        │  Show Error │
                        │  (Retry)    │
                        └─────────────┘
```

### Verification Page States

```
┌─────────────┐
│   Loading   │
│ (Verifying) │
└──────┬──────┘
       │
       ├─── Valid Token ──▶ ┌─────────────┐
       │                    │  Success    │
       │                    │ + Countdown │
       │                    │ + Redirect  │
       │                    └─────────────┘
       │
       └─── Invalid ──────▶ ┌─────────────┐
                            │   Error     │
                            │ + Recovery  │
                            └─────────────┘
```

### Password Reset Page States

```
┌─────────────┐
│   Initial   │
│   (Form)    │
└──────┬──────┘
       │
       │ Submit password
       │
┌──────▼──────┐
│ Validating  │
│  Password   │
└──────┬──────┘
       │
       ├─── Valid ──────▶ ┌─────────────┐
       │                  │ Submitting  │
       │                  │  to API     │
       │                  └──────┬──────┘
       │                         │
       │                         ├─ Success ─▶ ┌──────────┐
       │                         │             │ Success  │
       │                         │             │+Redirect │
       │                         │             └──────────┘
       │                         │
       │                         └─ Error ───▶ ┌──────────┐
       │                                       │  Error   │
       │                                       │ Message  │
       │                                       └──────────┘
       │
       └─── Invalid ────▶ ┌─────────────┐
                          │   Show      │
                          │ Validation  │
                          │   Error     │
                          └─────────────┘
```

---

## Complete User Journey Map

```
                        ┌─────────────────────┐
                        │   User Arrives at   │
                        │   Klassenbuch App   │
                        └──────────┬──────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
           ┌────────▼────────┐         ┌─────────▼─────────┐
           │  Has Account?   │         │   New User?       │
           │  → /login       │         │   → /register     │
           └────────┬────────┘         └─────────┬─────────┘
                    │                             │
         ┌──────────┴──────────┐                  │
         │                     │                  │
    ┌────▼─────┐      ┌───────▼──────┐          │
    │ Success  │      │ Email Not    │          │
    │ → /dash  │      │  Verified?   │          │
    └──────────┘      └───────┬──────┘          │
                              │                  │
                   ┌──────────▼────────┐         │
                   │  Resend Dialog    │         │
                   │  or /resend       │         │
                   └──────────┬────────┘         │
                              │                  │
                              └──────────────────┘
                                       │
                            ┌──────────▼──────────┐
                            │  Check Email        │
                            │  Click Verify Link  │
                            └──────────┬──────────┘
                                       │
                            ┌──────────▼──────────┐
                            │ /verify-email/token │
                            │  → Success          │
                            └──────────┬──────────┘
                                       │
                            ┌──────────▼──────────┐
                            │   Back to /login    │
                            │   → Dashboard       │
                            └─────────────────────┘
```

---

## Key Takeaways

### User Experience Wins
✅ Auto-redirects reduce clicks
✅ Inline help text prevents confusion
✅ Error recovery options always available
✅ Countdown timers set expectations
✅ Password visibility toggles improve usability

### Error Handling Strategy
🔧 Client-side validation = Immediate feedback
🔧 Server errors = Clear recovery paths
🔧 Expired tokens = Easy resend options
🔧 Network failures = Retry capabilities

### Mobile Optimization
📱 Touch-friendly buttons (min 44px)
📱 Readable text (16px minimum)
📱 No horizontal scroll
📱 Accessible on all devices

---

**Created:** 2025-10-01
**Purpose:** Visual reference for email authentication flows
