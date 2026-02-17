# GÖSTA Prep 2026

Mobile-first PWA som hjälper NBI Handelsakademins .NET-klass att förbereda sig inför GÖSTA-mässan (IT-karriärmässa) den 19 februari 2026 i Göteborg.

## Features

- **30 företag** med ice-breakers, kontaktpersoner och smarta frågor
- **QR-koder** till LinkedIn, GitHub, Portfolio och CV
- **Anteckningar** per företag med autosave och AI-förslag
- **Elevator pitch-timer** (30s med 4 faser)
- **Foton** per företag (kamera + galleri med IndexedDB)
- **Dynamisk skill-matchning** — extraherar skills från portfolio/CV
- **Connection tracker** med konfetti vid milstolpar
- **Schema** med countdown till mässan
- **PWA** — installerbar, offline-kapabel

## Tech stack

React 19 + TypeScript + Vite 7 + Tailwind CSS v4 + Framer Motion

Vercel deployment med Edge + Node.js API routes.

## Utveckling

```bash
npm install
npx vite          # Dev server
npx tsc -b        # Type check (kör ALLTID före push)
npx vitest        # Tester
```

## Deploy

Auto-deploy via Vercel från `main`.

---

Byggd av NBI .NET-klassen 2025–2027.
