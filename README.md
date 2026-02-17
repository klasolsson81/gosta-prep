<div align="center">

# GÖSTA Prep 2026

**Ditt hemliga vapen på IT-karriärmässan**

[![Live Demo](https://img.shields.io/badge/Live-gosta--prep.vercel.app-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://gosta-prep.vercel.app)

[![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript_5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Vercel-000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

En **mobile-first PWA** byggd för NBI Handelsakademins .NET-klass inför [GÖSTA-mässan](https://goteborg.se/gosta) (Göteborgs största IT-karriärmässa) den 19 februari 2026 i Göteborg. 30 utställande företag, 800+ studenter — vår klass sticker ut.

## Vad appen gör

| Feature | Beskrivning |
|---------|-------------|
| **Företagskatalog** | 30 företag med beskrivning, kontakter, ice-breakers och smarta frågor |
| **QR-koder** | Swipebara kort med LinkedIn, GitHub, Portfolio och CV — redo att visas upp |
| **Anteckningar** | Strukturerade fält per företag med autosave och AI-baserade förslag |
| **Pitch-timer** | 30-sekunders elevator pitch med 4 faser och haptic feedback |
| **Skill-matchning** | Extraherar tekniska skills från din portfolio/CV och rankar företag efter relevans |
| **Connection tracker** | Progress bar + konfetti vid milstolpar (5:e och 10:e kontakten) |
| **Foton** | Ta bilder vid montern, komprimeras automatiskt, sparas lokalt i IndexedDB |
| **Quick Note** | Floating action button — under 10 sekunder från tryck till sparad anteckning |
| **Schema** | Tidslinje med live countdown och event-highlighting |
| **PWA** | Installerbar, offline-kapabel, service worker med smart caching |

## Tech stack

```
Frontend     React 19 · TypeScript 5.9 · Vite 7 · Tailwind CSS v4 · Framer Motion
Backend      Vercel Serverless (Node.js) + Edge Functions
Storage      localStorage · IndexedDB (foton) · Vercel Blob (CV)
Design       "Nordic Tech Noir" — mörkt tema, indigo accent, glassmorphism
```

### Arkitektur

```
┌─────────────────────────────────────────────┐
│  React SPA (PWA)                            │
│  ├── 5 flikar: Företag · Favoriter · QR ·   │
│  │              Schema · Profil             │
│  ├── localStorage (profil, anteckningar)    │
│  └── IndexedDB (foton som Blobs)            │
├─────────────────────────────────────────────┤
│  Vercel API Routes                          │
│  ├── /api/scan-company      (Edge)          │
│  ├── /api/scan-portfolio    (Edge)          │
│  ├── /api/extract-skills    (Edge)          │
│  ├── /api/suggest-note      (Edge)          │
│  ├── /api/find-cv           (Node.js)       │
│  └── /api/upload-cv         (Node.js + Blob)│
├─────────────────────────────────────────────┤
│  Service Worker                             │
│  ├── App shell    → stale-while-revalidate  │
│  ├── Fonts        → cache-first             │
│  └── Images       → cache-first             │
└─────────────────────────────────────────────┘
```

## Kom igång

```bash
# Installera
npm install

# Starta dev-server
npx vite

# Type check (kör ALLTID före push)
npx tsc -b

# Kör tester
npx vitest

# Bygg för produktion
npx tsc -b && npx vite build
```

## Projektstruktur

```
src/
├── components/
│   ├── Layout/          AppShell, BottomNav, QuickNoteFAB
│   ├── Onboarding/      5-stegs onboarding + skill-extrahering
│   ├── Companies/       Lista, detalj, anteckningar, pitch-timer, foton
│   ├── Favorites/       Favoritlista med antecknings-preview
│   ├── QRCodes/         Swipebar QR-karusell
│   ├── Schedule/        Tidslinje med countdown
│   └── Profile/         Inställningar, skills, dela-knapp
├── hooks/               useLocalStorage, useProfile, useDebounce, ...
├── utils/               Konfetti, haptic, bildkomprimering
├── lib/                 IndexedDB wrapper
└── data/                companies.json (30 företag)
```

## Privacy

All personlig data (profil, anteckningar, favoriter, foton) sparas **lokalt på enheten**. Ingen spårning, inga cookies. Enda server-kommunikation är CV-uppladdning (Vercel Blob) och valfria API-anrop för portfolio-scanning.

---

<div align="center">

Byggd med av **NBI Handelsakademin .NET-klassen 2025–2027**

</div>
