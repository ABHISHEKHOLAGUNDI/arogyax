# ArogyaX

## AI-Powered Multilingual Patient Case-Taking Software

**SIH Problem Statement 26047** — Ministry of Ayush / All India Institute of Ayurveda

> ⚠️ **Prototype** — Not for clinical production use. For SIH hackathon demonstration only.

---

## Overview

ArogyaX is an AI-powered system that collects, structures, and prepares patient case information **before** the doctor consultation. It supports multilingual input (English + Hindi), voice interaction, document scanning, and Ayurvedic assessment fields.

**ArogyaX does NOT diagnose.** It assists documentation. The doctor remains the final decision-maker.

## Architecture

```
Patient UI (React + Vite + Tailwind)
        │
        ▼
Cloudflare Worker (Hono + TypeScript)
        │
   ┌────┼────────────┐
   ▼    ▼            ▼
OpenAI  D1 (SQLite)  R2 (Storage)
 API    Database     Documents
   │
   ▼
Structured AI Output
        │
        ▼
Doctor Dashboard → FHIR Export
```

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS |
| Backend   | Cloudflare Workers, Hono framework  |
| Database  | Cloudflare D1 (SQLite)              |
| Storage   | Cloudflare R2                       |
| AI        | OpenAI API (Responses API)          |
| Validation| Zod                                 |

## Repository Structure

```
arogyax/
├── apps/
│   ├── web/              # React frontend
│   │   └── src/
│   │       ├── components/
│   │       ├── pages/
│   │       ├── hooks/
│   │       ├── services/
│   │       ├── contexts/
│   │       ├── types/
│   │       └── utils/
│   └── worker/           # Cloudflare Worker backend
│       └── src/
│           ├── routes/
│           ├── middleware/
│           ├── services/
│           ├── ai/
│           ├── db/
│           ├── schemas/
│           ├── types/
│           └── utils/
├── packages/
│   └── shared/           # Shared types, constants, schemas
│       ├── types/
│       ├── constants/
│       └── schemas/
├── migrations/           # D1 database migrations
├── scripts/              # Utility scripts
├── docs/                 # Documentation
├── wrangler.toml         # Cloudflare configuration
└── package.json          # Root workspace config
```

## Prerequisites

- **Node.js** 18+ ([nodejs.org](https://nodejs.org))
- **npm** 9+ (comes with Node.js)
- **Cloudflare account** (free tier works)
- **OpenAI API key** (for AI features)

## Quick Start (Local Development)

### 1. Clone & Install

```bash
cd arogyax
npm install
```

### 2. Create Environment File

```bash
copy .env.example .env
```

Edit `.env` with your settings. For demo mode (no OpenAI key needed):

```
VITE_DEMO_MODE=true
```

### 3. Start Backend (Worker)

```bash
npm run dev:worker
```

Worker starts at: `http://localhost:8787`

Test health check:

```bash
curl http://localhost:8787/api/health
```

### 4. Start Frontend

In a **new terminal**:

```bash
npm run dev:web
```

Frontend starts at: `http://localhost:5173`

### 5. Verify Connectivity

Open `http://localhost:5173` in your browser. You should see:
- ArogyaX landing page
- Green "Connected" indicator in System Status card

## Cloudflare Deployment

### 1. Login

```bash
npx wrangler login
```

### 2. Create Resources

```bash
npx wrangler d1 create arogyax-db
npx wrangler r2 bucket create arogyax-documents
```

### 3. Update wrangler.toml

Replace `REPLACE_WITH_ACTUAL_D1_DATABASE_ID` with the ID from step 2.

### 4. Set Secrets

```bash
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put JWT_SECRET
```

### 5. Run Migrations

```bash
npx wrangler d1 migrations apply arogyax-db --remote
```

### 6. Deploy

```bash
npm run build
npx wrangler deploy
```

## Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Worker secret | OpenAI API key |
| `JWT_SECRET` | Worker secret | JWT signing secret |
| `OPENAI_MODEL` | wrangler.toml | AI model (default: gpt-4o-mini) |
| `OPENAI_TRANSCRIPTION_MODEL` | wrangler.toml | Speech model (default: whisper-1) |
| `VITE_API_URL` | .env | Backend URL for frontend |
| `VITE_DEMO_MODE` | .env | Enable demo mode (true/false) |

## Demo Credentials

| Role   | Email            | Password |
|--------|------------------|----------|
| Doctor | doctor@arogyax.in | demo1234 |
| Admin  | admin@arogyax.in  | demo1234 |

*(Credentials configured in Phase 2)*

## Troubleshooting

### `npm install` fails
- Ensure Node.js 18+ is installed: `node --version`
- Clear cache: `npm cache clean --force`
- Delete `node_modules` and retry

### Worker won't start
- Check `wrangler.toml` syntax
- Ensure no other process on port 8787
- Try: `npx wrangler dev --config wrangler.toml`

### Frontend shows "Disconnected"
- Ensure worker is running on port 8787
- Check browser console for CORS errors
- Verify Vite proxy config in `vite.config.ts`

## License

MIT — For SIH hackathon use.
