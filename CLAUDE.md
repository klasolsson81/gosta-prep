# GÖSTA Prep 2026 – En mäss-app för NBI-klassen

## Projektöversikt

En **mobile-first PWA** som förbereder hela NBI Handelsakademins .NET-klass inför GÖSTA-mässan (IT-karriärmässa) den 19 februari 2026 på Lindholmen i Göteborg. 30 utställande företag, 800+ studenter – vår klass ska sticka ut.

Appen ska vara ett "hemligt vapen" på mässdagen: QR-koder redo, företagsinfo med ice-breakers, anteckningar efter samtal, och allt i fickan.

**Språk i appen:** Svenska (företagsdata kan vara på engelska om katalogen är det)

---

## STEG 0 – PARSA GÖSTA-KATALOGEN (GÖR DETTA FÖRST!)

Det finns en PDF-fil i projektmappen: `gosta-katalog-2026.pdf` (ca 50 MB).

### Instruktioner:
1. Installera `pdfplumber` eller `PyMuPDF` (pymupdf) med pip
2. Skriv ett Python-script `scripts/parse-catalog.py` som:
   - Läser hela PDF:en
   - Extraherar **alla företag** med:
     - Företagsnamn
     - Logotyp (om möjligt, annars skippa)
     - Beskrivning/Vad de gör
     - Vad de söker (typer av roller, kompetenser)
     - Kontaktpersoner (namn, titel/roll om tillgängligt)
     - Hemsida/URL
     - Sociala medier (om tillgängligt)
   - Sparar resultatet som `src/data/companies.json`
3. Om PDF:en innehåller bilder av företagsloggor – extrahera dem till `public/logos/`
4. Granska output – se till att alla ~30 företag fångats korrekt

### JSON-format (target):
```json
[
  {
    "id": "deloitte",
    "name": "Deloitte",
    "logo": "/logos/deloitte.png",
    "description": "Konsultföretag inom revision, rådgivning...",
    "seeking": ["Cybersecurity", "IT-konsulter", "Sommarpraktikanter"],
    "contacts": [
      { "name": "Anna Svensson", "role": "Talent Acquisition" }
    ],
    "website": "https://deloitte.se",
    "tags": ["konsult", "cybersecurity", "big4"],
    "iceBreakers": []
  }
]
```

**OBS:** `iceBreakers` fylls i automatiskt i steg 1 baserat på företagets data. Se steg 1.

---

## STEG 1 – GENERERA ICE-BREAKERS

Efter att `companies.json` är skapad, skriv ett script eller gör det inline som genererar 3 ice-breakers per företag. Dessa ska vara:

- Baserade på vad företaget faktiskt gör/söker
- I stil med lärarens instruktioner (se TEACHER_INSTRUCTIONS.md)
- Inte generic "Hej jag heter..." utan mer:
  - "Jag såg att ni jobbar med [X], jag byggde en liten variant med [Y] – vill ni se den på 20 sek?"
  - "Vad är ert största problem just nu i [deras område]?"
  - "Vad skiljer en junior som lyckas hos er från en som fastnar?"

Spara ice-breakers direkt i varje företags-objekt i `companies.json`.

---

## STEG 2 – BYGGA APPEN

### Tech stack
- **React 18+ med TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (mobile-first)
- **qrcode.react** (QR-kodsgenerering)
- **localStorage** för personlig data (inga cookies/sessionstorage)
- **Vercel API Routes** (en serverless-funktion för CV-finder)
- **PWA** med manifest + service worker (installerbar på hemskärm)

### Design & Estetik
Appen ska ha en **distinkt, modern, premium känsla** – inte generisk AI-design.

- **Tema:** Mörkt tema som bas med levande accentfärger (tänk GÖSTA:s egna färger som inspiration men gör det eget)
- **Typografi:** Använd en distinkt display-font (t.ex. från Google Fonts) + clean body-font. INTE Inter/Roboto/Arial.
- **Animationer:** Subtila men snygga page-transitions, cards som fader in, smooth swipe-gestures på QR-korten
- **Känsla:** Professionellt men med energi – det här är en mässdag, det ska kännas lite "game time"
- **Ikoner:** Lucide React eller liknande

### Responsivt
- **Mobile-first** (360px-430px primärt)
- Ska se bra ut på desktop också
- Bottom navigation på mobil, sidebar/top-nav på desktop

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

**Företagslista** – Snygga kort med:
- Logotyp (eller bokstavs-avatar som fallback)
- Företagsnamn
- 1-rads tagline
- Tags (t.ex. "Konsult", "Cybersecurity")
- Favorit-stjärna

**Företagssida** (klick på kort):
- Header med logga + namn
- **"Vad de gör"** – kort beskrivning
- **"Vad de söker"** – tydlig lista
- **"Kontaktpersoner"** – namn + roll. Formaterat snyggt.
- **"Ice-breakers 🧊"** – 3 förslag, copy-to-clipboard eller bara läsa
- **"Smarta frågor"** – 3–5 generella frågor (från lärarens lista, se TEACHER_INSTRUCTIONS.md)
- **"Dina anteckningar"** – textfält som sparas i localStorage per företag
  - Förfylld mall: "Pratade med: \nOm: \nNästa steg: \nFölja upp: "
- **Favorit-knapp** (stor, tydlig)
- **Länk till hemsida**

### 4. Favoriter-fliken
- Lista av favorit-markerade företag
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

## VERCEL API ROUTE – CV FINDER

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
├── scripts/
│   └── parse-catalog.py
├── gosta-katalog-2026.pdf          ← Klas lägger in denna
├── public/
│   ├── logos/                       ← Extraherade loggor
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── data/
│   │   └── companies.json          ← Genererad från PDF
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── BottomNav.tsx
│   │   │   └── AppShell.tsx
│   │   ├── Onboarding/
│   │   │   ├── Welcome.tsx
│   │   │   ├── NameStep.tsx
│   │   │   ├── LinkedInStep.tsx
│   │   │   ├── PortfolioStep.tsx
│   │   │   ├── GitHubStep.tsx
│   │   │   ├── CVStep.tsx
│   │   │   └── Complete.tsx
│   │   ├── Companies/
│   │   │   ├── CompanyList.tsx
│   │   │   ├── CompanyCard.tsx
│   │   │   ├── CompanyDetail.tsx
│   │   │   └── SearchBar.tsx
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
│   │   ├── useLocalStorage.ts
│   │   └── useProfile.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── cvFinder.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── api/
│   └── find-cv.ts                   ← Vercel serverless function
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
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

1. `npm create vite@latest gosta-prep -- --template react-ts`
2. Installera: `tailwindcss`, `qrcode.react`, `lucide-react`, `react-router-dom`
3. Konfigurera Tailwind, PWA manifest
4. Bygg appen enligt specen ovan
5. `vercel.json` för att stödja API route + SPA routing
6. Deploy till Vercel

---

## PRIORITERINGSORDNING

Om tiden är knapp, bygg i denna ordning:
1. ✅ Parsa PDF → companies.json
2. ✅ Grundapp med routing och bottom nav
3. ✅ Företagslista + sök + företagssida
4. ✅ Onboarding med profilinställning
5. ✅ QR-koder
6. ✅ Favoriter + anteckningar
7. ✅ Schema
8. ✅ CV-finder (API route)
9. ✅ PWA (manifest, service worker, ikoner)
10. ✅ Polish: animationer, transitions, final design
