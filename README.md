# Farhan MCQ — Frontend

A modern, production-grade web application for Bangladesh government job exam preparation. **Farhan MCQ** provides topic-wise MCQ practice, live model tests, past-year solutions, exam routines, syllabi, job circulars, and subscription management — all in one platform.

Built with **Next.js 16** (App Router), **React 19**, and **TypeScript 5**.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Prerequisites](#prerequisites)
6. [Setup Guide](#setup-guide)
7. [Environment Variables](#environment-variables)
8. [Available Scripts](#available-scripts)
9. [Routing](#routing)
10. [API Integration](#api-integration)
11. [AI Features](#ai-features)
12. [Project Structure](#project-structure)
13. [Security](#security)
14. [Performance](#performance)

---

## Overview

The frontend serves two primary audiences:

| Role | Access | Key capabilities |
|------|--------|------------------|
| **Members** | `/dashboard`, `/exam/*`, `/profile` | Take timed exams, view marksheets, manage favorites, subscribe to packages |
| **Admins** | `/admin/*` | Manage question banks, publish routines, configure packages, run AI imports, automate broadcasts |

The application supports a **mock mode** for UI development without a running backend, and a **live mode** that proxies API calls to the Express backend on port 3002.

---

## Features

### Member portal

- Dashboard with progress overview and quick navigation
- Live MCQ exams with auto-submit and instant results
- Marksheet with per-question performance breakdown
- Favorites for bookmarking important questions
- Exam routines, syllabi, and job circulars (public and authenticated views)
- Push notifications for exams, results, and announcements
- Subscription packages with bKash/Nagad payment flow
- Profile and account management

### Admin panel

- Exam category and sub-category management
- Question bank with topic/subject tagging and filtering
- Question set creation, publishing, and automation
- AI-assisted question and routine import
- Slide and video content management
- Broadcast automation for social platforms
- Package, transaction, and notification administration
- Platform settings and AI provider key management

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 |
| Styling | Tailwind CSS 4 + tw-animate-css |
| Components | Radix UI + shadcn/ui |
| State | Zustand 5 |
| Forms | React Hook Form 7 + Zod 4 |
| Icons | Lucide React |
| Notifications | Sonner |
| Theme | next-themes |
| Typography | Hind Siliguri (Bengali + Latin) |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              App Router (src/app/)                   │
│   (public) │ (auth) │ (member) │ (admin) │ api/    │
├─────────────────────────────────────────────────────┤
│              Feature Modules (src/features/)         │
│   components · services · schemas · types            │
├─────────────────────────────────────────────────────┤
│         Shared UI (src/components/)                  │
├─────────────────────────────────────────────────────┤
│    Core (src/lib/, src/config/, src/hooks/)         │
│   API client · store · env · routes · middleware     │
└─────────────────────────────────────────────────────┘
```

### Design principles

- **Feature isolation** — each module owns its components, services, schemas, and types
- **Type safety** — end-to-end TypeScript with Zod runtime validation
- **Mock-ready** — `USE_MOCKS` switches feature services between mock and real API implementations
- **Same-origin API proxy** — development rewrites `/api/v1/*` to the backend, avoiding CORS issues
- **Server-side secrets** — AI keys and internal secrets never use the `NEXT_PUBLIC_` prefix

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | ≥ 18.x (20+ recommended) |
| npm | ≥ 9.x |
| Backend API | Running on port 3002 (when `USE_MOCKS=false`) |

---

## Setup Guide

Follow these steps to run the frontend locally against the live backend.

### Step 1 — Install dependencies

```bash
cd frontend
npm install
```

### Step 2 — Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values. See [Environment Variables](#environment-variables) for the full reference.

**Minimum configuration for local development with the backend:**

```env
USE_MOCKS=false
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_API_ORIGIN=http://localhost:3002
API_PROXY_TARGET=http://localhost:3002
INTERNAL_API_SECRET=<match backend .env>
JWT_SECRET=<match backend .env>
```

> `INTERNAL_API_SECRET` and `JWT_SECRET` must be **identical** to the values in `backend/.env`. They are used by server-side Next.js API routes and are never sent to the browser.

### Step 3 — Start the backend

From the `backend/` directory:

```bash
docker compose up -d postgres redis minio minio-init
npm run db:migrate
npm run dev
```

Confirm the backend is healthy:

```bash
curl http://localhost:3002/api/health
```

### Step 4 — Start the frontend

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

### Step 5 — (Optional) Configure AI providers

To use admin AI import features (question parsing, routine generation), add at least one provider key to `.env.local`:

```env
GEMINI_API_KEY=your-key-from-https://aistudio.google.com/apikey
```

Alternatively, manage keys through the admin panel — they are stored encrypted in the backend database.

### Step 6 — Mock-only development (no backend)

To develop UI without the Express API:

```env
USE_MOCKS=true
```

Feature modules automatically switch to in-memory mock services. No `NEXT_PUBLIC_API_URL` is required in this mode.

### Step 7 — Production build

```bash
npm run build
npm start
```

Set `NEXT_PUBLIC_API_URL` to your production API URL (e.g. `https://api.farhanmcq.com/api`) and configure `NEXT_PUBLIC_APP_URL` for CORS headers.

---

## Environment Variables

Variables are loaded from `.env.local` (development) or your deployment platform's environment configuration (production).

> **Security rule:** Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. All API keys and shared secrets must remain server-side.

### API connectivity

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `USE_MOCKS` | No | `true` | `"true"` uses mock services; `"false"` calls the real backend |
| `NEXT_PUBLIC_API_URL` | No | `/api` (client) | Base URL for browser API requests. Use `/api` in dev (proxied) |
| `NEXT_PUBLIC_API_ORIGIN` | No | `http://localhost:3002` | Backend origin for CSP `connect-src` and server-side fetches |
| `API_PROXY_TARGET` | No | `http://localhost:3002` | Rewrite target in `next.config.ts` for `/api/v1/*` |
| `NEXT_PUBLIC_APP_URL` | No | `https://farhanmcq.com` | Site URL for CORS headers on `/api/*` routes |

**Analysis:**

- **`USE_MOCKS`** — Controls the service factory in each feature module (`src/features/*/index.ts`). When `true`, or when `NEXT_PUBLIC_API_URL` is unset, modules fall back to mock implementations for dashboard, questions, auth, and related features.
- **`NEXT_PUBLIC_API_URL`** — The browser `api-client.ts` prepends this to all REST paths (e.g. `/api` + `/v1/auth/login`). In development, `/api` is rewritten to the Express backend by Next.js, so the browser makes same-origin requests without CORS preflight.
- **`NEXT_PUBLIC_API_ORIGIN`** — Used in `middleware.ts` to build the Content-Security-Policy `connect-src` directive, allowing the frontend to reach the backend. Also used by server-side utilities (`ai-key-store.ts`, `broadcast-backend.ts`) for direct backend calls.
- **`API_PROXY_TARGET`** — Only affects the Next.js dev/build rewrite rule. In production behind a reverse proxy, configure the proxy to route `/api/v1/*` to the backend instead.

### Shared secrets (server-side only)

| Variable | Required | Description |
|----------|----------|-------------|
| `INTERNAL_API_SECRET` | **Yes** (live mode) | Authenticates server-to-server calls to the Express API |
| `JWT_SECRET` | **Yes** (live mode) | Verifies JWTs in admin guards and broadcast utilities |

**Analysis:** These must match `backend/.env` exactly. `INTERNAL_API_SECRET` is sent as a header when Next.js API routes (`/api/ai/*`, `/api/admin/*`) communicate with the backend. `JWT_SECRET` is used by `admin-guard.ts` and `broadcast-backend.ts` to validate tokens on the server without exposing verification logic to the client.

### AI provider keys (server-side, optional)

Used by Next.js API routes under `src/app/api/ai/*` and the shared model catalog (`src/lib/ai-model-catalog.ts`). Keys support comma-separated lists for round-robin across multiple accounts.

| Variable | Provider | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini | Single key |
| `GEMINI_API_KEYS` | Google Gemini | Comma-separated key pool |
| `GEMINI_MODEL` | Google Gemini | Model override (default: `gemini-pro-3.1`) |
| `MISTRAL_API_KEY` | Mistral | Single key |
| `MISTRAL_API_KEYS` | Mistral | Comma-separated key pool |
| `MISTRAL_MODEL` | Mistral | Model override (default: `mistral-large-latest`) |
| `ANTHROPIC_API_KEY` | Anthropic | Single key |
| `ANTHROPIC_API_KEYS` | Anthropic | Comma-separated key pool |
| `ANTHROPIC_MODEL_OPUS` | Anthropic | Opus model slug (default: `claude-opus-4-8`) |
| `ANTHROPIC_MODEL_SONNET` | Anthropic | Sonnet model slug (default: `claude-sonnet-5`) |
| `OPENAI_API_KEY` | OpenAI | Single key |
| `OPENAI_API_KEYS` | OpenAI | Comma-separated key pool |
| `OPENAI_MODEL` | OpenAI | Model override (default: `gpt-4o`) |
| `OPENAI_MODEL_MINI` | OpenAI | Mini model override (default: `gpt-4o-mini`) |
| `OMNIROUTE_API_KEY` | OmniRoute | Self-hosted gateway key |
| `OMNIROUTE_BASE_URL` | OmniRoute | Gateway URL (default: `http://localhost:20128/v1`) |
| `OMNIROUTE_MODEL` | OmniRoute | Fallback model (default: `auto`) |

**Analysis:** The AI catalog merges keys from `.env.local` and the backend database (admin-managed, encrypted). Duplicate keys are deduplicated. OmniRoute is a self-hosted OpenAI-compatible gateway and works without a key in local setups. At least one provider key is required to use AI import pages in the admin panel.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run dev:clean` | Clear `.next` cache and start dev server |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Routing

Routes are centrally defined in `src/config/routes.ts` with type-safe path builders.

### Route groups

| Group | Paths | Access |
|-------|-------|--------|
| `(public)` | `/`, `/routines`, `/syllabus`, `/job-circular` | Everyone |
| `(auth)` | `/login`, `/register`, `/onboarding` | Unauthenticated users |
| `(member)` | `/dashboard`, `/exam/*`, `/profile`, `/subscriptions` | Authenticated members |
| `(admin)` | `/admin/*` | Admin users |
| `api/` | `/api/ai/*`, `/api/admin/*` | Server-side API routes |

### Example path builders

```typescript
ROUTES.dashboard                          // "/dashboard"
ROUTES.adminCategories                    // "/admin/categories"
ROUTES.examCategory("bcs")               // "/exams/bcs"
ROUTES.marksheet("attempt-123")          // "/marksheet/attempt-123"
```

---

## API Integration

### Browser client (`src/lib/api-client.ts`)

- Prepends `NEXT_PUBLIC_API_URL` to all endpoints
- Attaches JWT from `localStorage` as `Authorization: Bearer <token>`
- 15-second request timeout via `AbortController`
- Structured `ApiError` with status, message, and field-level details
- Full CRUD: `get`, `post`, `put`, `patch`, `delete`

### Development proxy (`next.config.ts`)

```
Browser  →  GET /api/v1/auth/login
Next.js  →  rewrite to http://localhost:3002/api/v1/auth/login
```

App Router handlers under `/api/ai/*` and `/api/admin/*` take precedence over the rewrite and execute as Next.js server routes.

### Mock switching

Each feature module selects its service implementation at import time:

```typescript
// src/features/auth/index.ts
process.env.USE_MOCKS === "true" ? mockAuthService : apiAuthService;
```

---

## AI Features

Server-side AI routes power admin workflows:

| Route | Purpose |
|-------|---------|
| `/api/ai/parse-questions` | Parse raw text into structured MCQ objects |
| `/api/ai/generate-routine` | Generate exam routine content |
| `/api/ai/model-catalog` | List available models and provider status |
| `/api/admin/automation/generate-post` | Generate social broadcast copy |
| `/api/admin/automation/send` | Dispatch broadcast to configured platforms |

The model catalog (`src/lib/ai-model-catalog.ts`) calls each provider's official API directly. Keys are pooled with round-robin and rate-limit cooldown across env and database sources.

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (admin)/            # Admin panel routes
│   │   ├── (auth)/             # Login, register, onboarding
│   │   ├── (member)/           # Member dashboard and exams
│   │   ├── (public)/           # Public content pages
│   │   └── api/                # Server-side API routes (AI, admin)
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── layout/             # App shell and sidebar
│   │   ├── admin/              # Admin shared components
│   │   └── shared/             # Cross-cutting components
│   ├── features/               # Feature modules
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # API client, AI catalog, utilities
│   ├── config/                 # Env, routes, navigation
│   └── middleware.ts           # Security headers and route guards
├── next.config.ts
├── .env.example
└── .env.local                  # Local config (not committed)
```

---

## Security

| Measure | Implementation |
|---------|----------------|
| Content Security Policy | Strict CSP in `middleware.ts` with `connect-src` tied to `NEXT_PUBLIC_API_ORIGIN` |
| Security headers | `X-Frame-Options`, `HSTS`, `X-Content-Type-Options`, `Referrer-Policy` |
| No framework fingerprint | `poweredByHeader: false` in Next.js config |
| Server-side secrets | AI keys and `INTERNAL_API_SECRET` never use `NEXT_PUBLIC_` |
| API route caching | `Cache-Control: no-store` on `/api/*` responses |
| Request timeout | 15-second AbortController in the API client |
| Environment validation | Zod schema in `src/config/env.ts` |

---

## Performance

| Optimization | Details |
|-------------|---------|
| Image formats | AVIF and WebP with 30-day cache TTL |
| Static assets | Immutable `Cache-Control` (1 year) for fonts and images |
| Bundle size | `optimizePackageImports` for lucide-react and zod |
| Client caching | Zustand store with 10-minute TTL and stale-while-revalidate |
| Request deduplication | In-flight request map in `useCachedFetch` |
| Route prefetching | `usePrefetchRoutes` for anticipated navigation |
| Compression | Gzip/Brotli enabled via Next.js config |
| Font loading | Hind Siliguri with `display: swap` |

---

## License

Private — All rights reserved.
