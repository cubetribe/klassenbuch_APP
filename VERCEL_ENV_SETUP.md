# Vercel Environment Variables Setup

## KRITISCH: Diese Environment Variables MÜSSEN im Vercel Dashboard gesetzt werden!

Login zu Vercel: https://vercel.com/dashboard

### 1. Navigate to Project Settings
- Go to your project: `klassenbuch-app-3xol`
- Click on "Settings" tab
- Click on "Environment Variables" in the left sidebar

### 2. Add/Update these variables:

#### NEXT_PUBLIC_API_URL (CRITICAL!)
```
Key: NEXT_PUBLIC_API_URL
Value: https://klassenbuch-app-3xol.vercel.app
Environment: ✅ Production, ✅ Preview, ✅ Development
```

#### DATABASE_URL
```
Key: DATABASE_URL
Value: postgresql://postgres:gwuayOLoaueVIMHXGmCCyPClEjCrTLZB@hopper.proxy.rlwy.net:40213/railway
Environment: ✅ Production, ✅ Preview, ✅ Development
```

#### NEXTAUTH_URL
```
Key: NEXTAUTH_URL  
Value: https://klassenbuch-app-3xol.vercel.app
Environment: ✅ Production, ✅ Preview, ✅ Development
```

#### NEXTAUTH_SECRET
```
Key: NEXTAUTH_SECRET
Value: htWeMv4o8G9yLHgtUM1I8lo8ADzetrNsZo/BwfThXto=
Environment: ✅ Production, ✅ Preview, ✅ Development
```

### 3. WICHTIG: Nach dem Setzen der Variables

1. **Redeploy erforderlich!** Die Variables werden erst nach einem neuen Build aktiv.
2. Klicke auf "Redeploy" im Vercel Dashboard
3. Wähle "Redeploy with existing Build Cache" für schnelleres Deployment

### 4. Verify after deployment

Check if the variables are loaded correctly:
```bash
# Open browser console on the deployed site and check:
console.log(process.env.NEXT_PUBLIC_API_URL)
# Should output: https://klassenbuch-app-3xol.vercel.app
```

## Troubleshooting

### Wenn API Calls immer noch 404 zurückgeben:
1. Cache leeren (Cmd+Shift+R oder Ctrl+Shift+R)
2. Vercel Function Logs prüfen
3. Sicherstellen dass NEXT_PUBLIC_API_URL mit "NEXT_PUBLIC_" prefix beginnt (wichtig für Client-Side!)

### Wenn Session nicht funktioniert:
1. NEXTAUTH_URL muss EXACT die deployment URL sein (ohne trailing slash!)
2. NEXTAUTH_SECRET muss in allen Environments identisch sein
3. Cookies im Browser löschen und neu einloggen

## Current Status
- ❌ NEXT_PUBLIC_API_URL nicht gesetzt → API calls schlagen fehl
- ✅ Database connection funktioniert
- ⚠️ Session management needs testing after env vars are set