# 🌾 AgroGuide

**Intelligence for Every Stage of Farming.**
*Plan better. Grow smarter. Protect your crops. Sell better.*

AgroGuide is an AI-powered digital farming companion that helps farmers through the complete farming lifecycle — **Plan → Soil → Seed → Sow → Grow → Protect → Harvest → Store → Sell → Government Support** — in one mobile-friendly app.

The app is fully functional out of the box in **demo mode**: clone it, run `npm install && npm run dev`, and you'll see a complete, realistic experience (sample farmer in Coimbatore, Tamil Nadu) even before external API keys are configured.

---

## 1. Features

- **Dashboard** — real weather, active crop progress (from Firestore), smart alerts, real market snapshot, matched government schemes, daily farmer wisdom ticker, AI assistant entry point — shows honest empty states instead of placeholder data
- **Daily Farmer Wisdom** — daily rotating wisdom alternating between authentic 2-line **Thirukkural** (Chapter 104 — *உழவு*) and traditional Tamil agricultural proverbs (*விவசாயப் பழமொழிகள்*)
- **My Farm** — farms and crops stored in Firestore, with a computed crop lifecycle timeline (estimated from sowing and expected harvest dates)
- **AI Crop Doctor** — dedicated multimodal diagnostic page: camera capture or gallery upload, confidence-rated AI vision assessment via OpenRouter vision models (e.g. `google/gemini-2.5-flash`, `openai/gpt-4o-mini`), structured diagnosis with conservative guidelines, never a fabricated certainty
- **Weather** — current conditions, hourly/7-day forecast, and plain-language farming advisories with a "Why?" explanation, powered by free Open-Meteo
- **AgroGuide AI** — context-aware chat assistant (via OpenRouter) grounded in the farmer's real soil, crop, stage, location, and weather data, with Tamil/English voice input and text-to-speech playback
- **Soil Health** — soil test parameter entry (pH, N, P, K, EC, OC) with agronomic guidelines and soil report upload
- **Smart Irrigation Advisor** — irrigation recommendation with transparent reasoning based on soil type, crop stage, and live rainfall forecast
- **Market Intelligence** — real mandi prices from the official Government of India Agmarknet dataset via data.gov.in with tiered query fallback and a "Where should I sell?" net-return estimate
- **Government Services Hub** — curated directory of **official** central & Tamil Nadu government schemes, a relevance matcher labeled "Likely/May be relevant", and a search tool — links out to official portals only
- **Finance & Loans** — expense tracker with category breakdowns, profit dashboard with Recharts, farmer loan tracker, and EMI calculator
- **Crop Calendar** — add, complete, edit, and delete crop tasks categorized by agricultural stage
- **Farm Diary** — timeline of notes, photos, and crop observations
- **Farmer Community** — category-filtered peer discussions, posts, likes, comments, and community moderation
- **Emergency Center** — safety guidance for flood, cyclone, drought, fire, pest outbreak, and irrigation failure, linking directly to official disaster-management resources (NDMA, TNSDMA, Kisan Call Center)
- **Complete Tamil Localization (100%)** — 1:1 parity between English and Tamil across all user-facing views, forms, navigation, auth screens, and dynamic components
- **Full Authentication** — Email/Password, Google, and Phone OTP via Firebase Authentication

Every module that depends on an external API (AI, market data) gracefully falls back to a **clearly labeled "unavailable" / demo state** if that API isn't configured — the app never crashes, shows a blank page, or silently presents fabricated data as real.

---

## 2. Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** — custom agricultural design system
- **Firebase** — Authentication, Firestore, Storage (Cloud Messaging optional)
- **OpenRouter** — LLM text chat & multimodal vision processing
- **Open-Meteo** — Keyless, real-time agro-meteorological weather data
- **data.gov.in / Agmarknet** — Official mandi market prices
- **Recharts** — Finance and farm analytics
- **Lucide React** — Agricultural and UI iconography

---

## 3. Project structure

```
app/
  page.tsx                → landing page
  login/, register/, forgot-password/  → auth screens
  (app)/                  → authenticated app shell (sidebar + bottom nav)
    layout.tsx
    dashboard/ farm/ crop-doctor/ weather/ ai/ soil/ irrigation/ market/
    government/ finance/ calendar/ diary/ community/
    emergency/ settings/
  api/ai/chat/route.ts        → server-only AgroGuide AI chat endpoint (uses lib/ai/provider.ts)
  api/ai/crop-doctor/route.ts → server-only AI Crop Doctor endpoint (uses lib/ai/provider.ts)
  api/market/route.ts         → server-only real mandi price endpoint (Agmarknet/data.gov.in)
components/
  ui/          → Logo, Toast, FarmerQuoteTicker, shared primitives
  layout/      → Sidebar, BottomNav, MobileDrawer, TopBar
  landing/     → hero illustration, landing sections
  finance/     → LoansPanel, expense charts
lib/
  ai/          → provider.ts, openrouter.ts (text & vision model support), prompts.ts
  firebase/    → config.ts (demo-mode-aware init), firestore.ts (ownership-scoped CRUD)
  market/      → marketService.ts, providers/agmarknet.ts
  services/    → weatherService, aiService, locationService, governmentService, loanService
  i18n/        → translations.ts (English and Tamil with full key parity)
hooks/
  useAuth.tsx  → auth context (Firebase or in-memory demo farmer)
  useLanguage.tsx → i18n hook with language switcher
types/
  index.ts     → all shared TypeScript types
data/
  quotes.ts    → authentic 2-line Thirukkurals & Tamil farming proverbs
  governmentServices.ts, demoData.ts, landingContent.ts, navigation.ts
firestore.rules / storage.rules / firebase.json / firestore.indexes.json
```

---

## 4. Local development

```bash
npm install
cp .env.example .env.local   # fill in real keys as needed
npm run dev
```

Visit `http://localhost:3000`.

---

## 5. Firebase setup (for real accounts & data)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication** → Sign-in method → enable **Email/Password**, **Google**, and **Phone**.
3. **Firestore Database** → Create database (production mode).
4. **Storage** → Get started (default bucket is fine).
5. Project settings → General → add a **Web app** → copy config into `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

6. Deploy security rules (requires the [Firebase CLI](https://firebase.google.com/docs/cli)):

```bash
npm install -g firebase-tools
firebase login
firebase use --add        # select your project
firebase deploy --only firestore:rules,storage:rules,firestore:indexes
```

---

## 6. Environment variables

See `.env.example` for the template.

| Variable | Required for | If missing |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | Real auth, Firestore, Storage | App runs fully in demo mode |
| `OPENROUTER_API_KEY` | AgroGuide AI chat & AI Crop Doctor | Server returns 501 (`SERVICE_NOT_CONFIGURED`); UI shows unavailable state |
| `OPENROUTER_MODEL` | Text model for AI Chat (e.g. `google/gemini-2.5-flash`, `meta-llama/llama-3.3-70b-instruct`) | Throws configuration error |
| `OPENROUTER_VISION_MODEL` | Multimodal model for Crop Doctor (e.g. `google/gemini-2.5-flash`, `openai/gpt-4o-mini`) | Falls back to `OPENROUTER_MODEL` if configured |
| `MARKET_API_KEY` | Live mandi price data (data.gov.in / Agmarknet) | Falls back to data.gov.in public sample key for development |
| `WEATHER_API_KEY` | Optional (Open-Meteo is free & keyless) | Uses Open-Meteo by default |
| `GEOCODING_API_KEY` | Optional (uses OpenStreetMap Nominatim) | Uses Nominatim by default |

**Never commit `.env.local`.**

---

## 7. AI & Crop Doctor configuration

AgroGuide AI and AI Crop Doctor call `/api/ai/chat` and `/api/ai/crop-doctor`, two Next.js API routes that run **server-side only** through the provider abstraction (`lib/ai/provider.ts` and `lib/ai/openrouter.ts`).

- `OPENROUTER_MODEL`: Used for text chat prompts.
- `OPENROUTER_VISION_MODEL`: Dedicated vision-capable model used for Crop Doctor image diagnostics.
- Neither API key nor prompt internals ever reach client-side bundles.
- If AI requests fail or are unconfigured, clean user-friendly alerts are rendered with retry options.

---

## 8. Deployment

```bash
git init && git add . && git commit -m "Initial commit"
```

1. Import your repository into [Vercel](https://vercel.com/new).
2. Configure environment variables in Project Settings.
3. Add your deployment domain to Firebase Authorized Domains.
4. Deploy.

---

## License

This project is open-source under the MIT License.

