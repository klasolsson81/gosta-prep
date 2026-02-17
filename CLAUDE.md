# GÖSTA Prep 2026 – En mäss-app för NBI-klassen

## Projektöversikt

En **mobile-first PWA** som förbereder hela NBI Handelsakademins .NET-klass inför GÖSTA-mässan (IT-karriärmässa) den 19 februari 2026 på Lindholmen i Göteborg. 30 utställande företag, 800+ studenter – vår klass ska sticka ut.

Appen ska vara ett "hemligt vapen" på mässdagen: QR-koder redo, företagsinfo med ice-breakers, anteckningar efter samtal, och allt i fickan.

**Språk i appen:** Svenska (företagsdata kan vara på engelska om katalogen är det)

---

## Tech stack
- **React 19 + TypeScript** (strict mode)
- **Vite 7** (build tool)
- **Tailwind CSS v4** (mobile-first, `@theme` directive)
- **Framer Motion** (animationer)
- **qrcode.react** (QR-kodsgenerering)
- **Lucide React** (ikoner)
- **localStorage** för personlig data (profil, favoriter, anteckningar)
- **IndexedDB** för foton per företag (Blob-lagring)
- **Vercel API Routes** (serverless + edge functions)
- **Vercel Blob Storage** för CV-uppladdning
- **PWA** med manifest + service worker (installerbar)

### Design: "Nordic Tech Noir"
- Mörkt tema med indigo accent (#6366f1)
- Outfit + JetBrains Mono (Google Fonts)
- Glassmorphism-effekter, subtila animationer
- Mobile-first (360px–430px), responsivt för desktop

---

## APP-STRUKTUR & FEATURES

### 1. Onboarding (första besöket)
Visas om ingen profil finns i localStorage.

**Välkomstskärm:**
- Snyggt GÖSTA-tema
- "Förbered dig för GÖSTA 2026 🚀"
- "Kom igång"-knapp

**Steg 1 – Ditt namn:**
- Input: Förnamn (obligatoriskt)

**Steg 2 – LinkedIn:**
- Rubrik: "Länka din LinkedIn"
- Input med prefix `linkedin.com/in/` – användaren skriver bara slug
- Hjälptext: "Öppna LinkedIn-appen → Din profil → Kopiera din URL"
- Knapp: "Hoppa över" (kan lägga till senare)

**Steg 3 – Portfolio:**
- Input: Full URL till portfolio-hemsida
- Hjälptext: "T.ex. klasolsson.se"
- "Hoppa över"

**Steg 4 – GitHub:**
- Input med prefix `github.com/` – användaren skriver bara användarnamn
- "Hoppa över"

**Steg 5 – CV (smart!):**
- Om portfolio-URL finns → Visa knapp: "🔍 Hitta CV från din portfolio"
  - Anropar `/api/find-cv` med portfolio-URL:en
  - Backend hämtar sidan, scannar efter PDF-länkar med nyckelord (cv, resume, curriculum)
  - Hittar → "✅ Vi hittade ditt CV: [länk]" → bekräfta med ett klick
  - Hittar inte → "Hittade inget CV automatiskt"
- Alternativ: "Klistra in länk till CV (Google Drive, Dropbox, etc.)"
- "Hoppa över"

**Klart-skärm:**
- Sammanfattning av profilen
- "Du är redo! 💪"

### 2. Bottom Navigation (5 flikar)
```
🏢 Företag | ⭐ Favoriter | 📱 QR-koder | 📅 Schema | 👤 Profil
```

### 3. Företag-fliken
**Sökfält** – sticky top, instant filter. Sök på namn, tags, vad de söker.

**Sortering** – Segmenterad kontroll under sökfältet:
- **A–Ö** (standard): Alfabetisk med svensk locale (`localeCompare('sv')`)
- **Monter**: Sorterat på monternummer, företag utan monter sist
- Sparas i localStorage (`gosta-sort-preference`)

**Lägg till företag** – Knapp bredvid sorteringskontrollen:
- Bottom sheet med URL-input + "Skanna"-knapp
- API-rutt (`/api/scan-company`) hämtar hemsidan och extraherar namn, beskrivning, taggar, logotyp
- Förhandsgranska & redigera innan tillägg
- Tillagda företag sparas i localStorage, visas med grön "Tillagd"-badge
- Kan tas bort från företagets detaljvy

**Företagslista** – Snygga kort med:
- Logotyp (eller bokstavs-avatar som fallback)
- Företagsnamn
- 1-rads tagline
- Tags (t.ex. "Konsult", "Cybersecurity")
- "Tillagd"-badge (grön) för custom-tillagda företag
- Favorit-stjärna

**Företagssida** (klick på kort):
- Header med logga + namn
- **"Vad de gör"** – kort beskrivning
- **"Vad de söker"** – tydlig lista
- **"Kontaktpersoner"** – namn + roll. Formaterat snyggt.
- **"Ice-breakers 🧊"** – 3 förslag, copy-to-clipboard (döljs om tomma)
- **"Smarta frågor"** – 3–5 generella frågor (döljs för custom-företag)
- **"Dina anteckningar"** – strukturerade fält (Pratade med, Roll, Om, Nästa steg, Följa upp, Övrigt) i localStorage
- **"Foton 📸"** – ta bilder med kameran eller välj från galleri, komprimeras till JPEG, sparas i IndexedDB. Galleri med thumbnails + fullskärms-lightbox.
- **Favorit-knapp** (stor, tydlig)
- **Länk till hemsida**
- **"Ta bort"** – Visas enbart för custom-tillagda företag, med bekräftelse

### 4. Favoriter-fliken
- Lista av favorit-markerade företag (inkl. custom-tillagda)
- Samma kort som i huvudlistan
- Antecknings-preview syns direkt
- Tom-state: "Inga favoriter ännu – gå till Företag och stjärnmarkera!"

### 5. QR-koder-fliken
- **Swipebara kort** (horisontell scroll/swipe)
- Varje kort:
  - Rubrik (t.ex. "LinkedIn", "Portfolio", "GitHub", "CV")
  - **Stor QR-kod** (lättskammad)
  - URL i text under
  - Bakgrund som kontrasterar för bra scanning
- Bara konfigurerade QR-koder visas
- Okonfigurerade: visa som "Lägg till"-kort med CTA

### 6. Schema-fliken
- Visuell tidslinje för mässdagen
- Händelser:
  - 08:30 – Frukostföreläsning med Axel Arigato (Torg Grön, Patricia, Forskningsgången 6) – Engelska
  - 10:00 – Mässan öppnar (Lindholmen Conference Center)
  - 10:00 – Lotteri: Första 200 får lott!
  - 12:00 – Lunchföreläsning: Deloitte Cybersecurity (Torg Grön, Patricia) – Svenska
  - 13:00 – Lotteridragning (kolla mobilen!)
  - 15:00 – Mässan stänger
  - 17:00+ – Göstas Mingel (slutsålt)
- Varje event: tid, titel, plats, kort beskrivning
- Nuvarande/kommande event highlightat baserat på klockan

### 7. Profil/Inställningar
- Visa & redigera: Namn, LinkedIn, Portfolio, GitHub, CV-länk
- Varje fält med "Ändra"-knapp
- CV-finder tillgänglig här också (om man hoppade över)
- "Återställ all data" med bekräftelse-dialog
- App-info: "GÖSTA Prep 2026 – Byggd av NBI .NET-klassen"

---

## VERCEL API ROUTES

### `/api/find-cv.ts`
Serverless function som:
1. Tar emot `{ url: string }` via POST
2. Hämtar HTML:en från URL:en (med timeout 5s)
3. Parsar alla `<a href="...">` och letar efter:
   - Filnamn som innehåller: cv, resume, curriculum, meritförteckning
   - Filändelser: .pdf, .doc, .docx
   - Alternativt text-innehåll i länken som matchar
4. Returnerar: `{ found: boolean, cvUrl?: string, candidates?: string[] }`
5. Error handling: timeout, ogiltig URL, CORS-problem

### `/api/scan-company.ts`
Edge function som skannar en företagshemsida:
1. Tar emot `{ url: string }` via POST
2. Hämtar HTML:en (med timeout 8s)
3. Extraherar:
   - Namn: `og:title` → `<title>`
   - Beskrivning: `og:description` → `<meta name="description">`
   - Taggar: `<meta name="keywords">`
   - Logotyp: `og:image` → `apple-touch-icon` → favicon
4. Returnerar: `{ name, description, website, tags, logo }`

### `/api/scan-portfolio.ts`
Edge function som skannar en portfolio-hemsida för sociala länkar (LinkedIn, GitHub, CV).

### `/api/upload-cv.ts`
Node.js runtime – hanterar CV-uppladdning till Vercel Blob Storage.

### `/api/suggest-note.ts`
Edge function – AI-driven förslag på anteckningar baserat på kontext.

---

## PWA-KONFIGURATION

- `manifest.json` med:
  - name: "GÖSTA Prep 2026"
  - short_name: "GÖSTA"
  - theme_color: matcha designen
  - Ikoner i alla storlekar (generera eller använd en enkel ikon)
  - display: "standalone"
  - start_url: "/"
- Service worker för offline-cache (företagsdata + app-shell)
- Installationsprompt hantering

---

## FILSTRUKTUR
```
gosta-prep/
├── CLAUDE.md
├── TEACHER_INSTRUCTIONS.md
├── public/
│   ├── logos/                       ← Företagsloggor
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── data/
│   │   └── companies.json          ← 30 företag med ice-breakers
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── AppShell.tsx
│   │   │   └── BottomNav.tsx
│   │   ├── Onboarding/
│   │   │   └── Onboarding.tsx       ← Alla steg i en fil
│   │   ├── Companies/
│   │   │   ├── CompanyList.tsx
│   │   │   ├── CompanyCard.tsx
│   │   │   ├── CompanyDetail.tsx
│   │   │   ├── AddCompany.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── PhotoGallery.tsx     ← Kamera + galleri + lightbox
│   │   ├── Favorites/
│   │   │   └── FavoritesList.tsx
│   │   ├── QRCodes/
│   │   │   ├── QRCarousel.tsx
│   │   │   └── QRCard.tsx
│   │   ├── Schedule/
│   │   │   └── Timeline.tsx
│   │   └── Profile/
│   │       └── ProfileSettings.tsx
│   ├── hooks/
│   │   ├── useLocalStorage.ts       ← Med cross-component sync event
│   │   ├── useProfile.ts            ← Profil + favoriter + anteckningar
│   │   ├── useCustomCompanies.ts    ← Egna tillagda företag
│   │   ├── useCompanyPhotos.ts      ← Foton per företag (IndexedDB)
│   │   └── useFieldValidation.ts    ← LinkedIn/GitHub/URL-validering
│   ├── lib/
│   │   └── photoDB.ts               ← IndexedDB wrapper (Blob-lagring)
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── compressImage.ts         ← JPEG-komprimering via canvas
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                    ← Tailwind v4 @theme + CSS vars
├── api/
│   ├── find-cv.ts                   ← Serverless: hitta CV-länk
│   ├── scan-company.ts              ← Edge: skanna företagshemsida
│   ├── scan-portfolio.ts            ← Edge: skanna portfolio
│   ├── upload-cv.ts                 ← Node.js: CV till Vercel Blob
│   └── suggest-note.ts              ← Edge: AI-anteckningsförslag
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json
```

---

## VIKTIGA DESIGNPRINCIPER

1. **Mobile-first, alltid.** Testa i 375px viewport.
2. **Snabb.** Appen ska kännas instant – ingen loading för företagsdata (den är baked-in).
3. **Tumvänlig.** Alla knappar minst 44x44px. Bottom nav. Inga små mål.
4. **Offline-kapabel.** PWA + service worker. Företagsdata ska funka utan nät.
5. **Personlig data stannar lokalt.** Allt i localStorage. Inget skickas till server (utom CV-finder-anropet).
6. **Progressiv.** Allt kan hoppas över i onboarding. Appen fungerar även med bara ett namn.
7. **Snygg.** Inte generisk – gå bold med typografi, färg, micro-animations. Se design-guidelines ovan.

---

## TEACHER INTEGRATION

Lärarens instruktioner (se TEACHER_INSTRUCTIONS.md) ska genomsyra appen:
- Ice-breakers är inspirerade av lärarens öppningsrepliker
- Smarta frågor i företagsvyn kommer från lärarens lista
- Anteckningsmallen följer lärarens format: Namn, Roll, Bolag, Vad vi pratade om, Nästa steg, Uppföljning
- Schema-sidan inkluderar allt som är relevant från mässdagen

---

## BUILD & DEPLOY

- Build: `npx tsc -b && npx vite build`
- Dev: `npx vite`
- Type check: `npx tsc -b` (**kör ALLTID före commit/push**)
- Deploy: Vercel (auto-deploy från main)
- `vercel.json` hanterar API routes + SPA routing
