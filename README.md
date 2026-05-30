<div align="center">

# 📝 Farhan MCQ

### সরকারি চাকরির পূর্ণাঙ্গ প্রস্তুতি প্ল্যাটফর্ম

A comprehensive exam preparation platform for Bangladesh government job aspirants — BCS, Bank, Primary Teacher, and more.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Private-red)](#)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [Environment Variables](#-environment-variables)
- [Routing & Navigation](#-routing--navigation)
- [State Management](#-state-management)
- [API Integration](#-api-integration)
- [UI Components](#-ui-components)
- [Feature Modules](#-feature-modules)
- [Performance Optimizations](#-performance-optimizations)
- [Security](#-security)
- [Contributing](#-contributing)

---

## 🌟 Overview

**Farhan MCQ** is a modern, production-grade web application designed to help Bangladeshi students prepare for competitive government exams. The platform provides topic-wise MCQ practice, live model tests, past-year question solutions, exam routines, syllabi, and job circulars — all in one place.

The application supports two main user roles:
- **Members** — Students who take exams, track progress, and manage subscriptions.
- **Admins** — Content managers who create question sets, manage categories, publish routines, and handle transactions.

---

## ✨ Features

### 👤 Member Portal
| Feature | Description |
|---------|-------------|
| 📊 Dashboard | Overview of exams, progress tracking, and quick navigation |
| 📝 Live MCQ Exams | Timed exam sessions with auto-submit and instant results |
| 📋 Marksheet | Detailed performance breakdown after each exam attempt |
| ⭐ Favorites | Bookmark important questions for later review |
| 📅 Routines | Exam schedules with date/time details |
| 📚 Syllabus | Structured syllabus viewer with HTML content support |
| 💼 Job Circulars | Latest government job notifications |
| 🔔 Notifications | Real-time alerts for new exams, results, and announcements |
| 💳 Subscriptions | Package-based access with bKash/Nagad payment support |
| 👤 Profile | User profile management with contact details |

### 🛠️ Admin Panel
| Feature | Description |
|---------|-------------|
| 📁 Categories | Manage exam categories (BCS, Bank, etc.) |
| 📂 Sub-Categories | Organize exams within categories |
| ❓ Question Bank | Full CRUD for questions with topic/subject tagging |
| 📋 Question Sets | Create and publish exam question sets |
| 🤖 Question Set Automation | Auto-generate question sets from the question bank |
| 📅 Routines | Schedule and publish exam routines |
| 📚 Syllabus | Upload and manage syllabus content |
| 💼 Job Circulars | Publish job notifications |
| 📦 Packages | Create subscription packages |
| 💰 Transactions | Review and approve payment transactions |
| 🔔 Notifications | Send push notifications to members |
| ⚙️ Settings | Platform configuration |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + [tw-animate-css](https://github.com/magicuidesign/tw-animate-css) |
| **Component Library** | [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **State Management** | [Zustand 5](https://zustand-demo.pmnd.rs/) |
| **Forms** | [React Hook Form 7](https://react-hook-form.com/) + [Zod 4](https://zod.dev/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Notifications (Toast)** | [Sonner](https://sonner.emilkowal.ski/) |
| **Theme** | [next-themes](https://github.com/pacocoursey/next-themes) |
| **Font** | [Hind Siliguri](https://fonts.google.com/specimen/Hind+Siliguri) (Bengali + Latin) |

---

## 🏗️ Architecture

The project follows a **feature-based modular architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                    App Layer                         │
│           (Next.js App Router Pages)                │
├─────────────────────────────────────────────────────┤
│                  Feature Modules                     │
│    (Self-contained: components, services, types)    │
├─────────────────────────────────────────────────────┤
│               Shared Components                      │
│         (UI primitives, layouts, shared)             │
├─────────────────────────────────────────────────────┤
│              Core Infrastructure                     │
│     (API client, store, hooks, config, types)       │
└─────────────────────────────────────────────────────┘
```

### Design Principles

- **Feature Isolation** — Each feature module encapsulates its own components, services, schemas, and types
- **Type Safety** — End-to-end TypeScript with Zod runtime validation
- **Performance First** — Built-in caching, request deduplication, and route prefetching
- **Scalable Routing** — Centralized route configuration with type-safe path builders
- **Mock-Ready** — Environment-driven mock/real API switching for independent frontend development

---

## 📁 Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (admin)/                # Admin route group
│   │   └── admin/
│   │       ├── categories/
│   │       ├── sub-categories/
│   │       ├── questions/
│   │       ├── question-sets/
│   │       ├── question-sets-automotion/
│   │       ├── routines/
│   │       ├── syllabus/
│   │       ├── job-circular/
│   │       ├── notifications/
│   │       ├── packages/
│   │       ├── subscriptions/
│   │       ├── transactions/
│   │       └── settings/
│   ├── (auth)/                 # Authentication route group
│   │   ├── login/
│   │   ├── register/
│   │   └── onboarding/
│   ├── (member)/               # Member route group
│   │   ├── dashboard/
│   │   ├── exam/
│   │   ├── exams/
│   │   ├── exam-subject-topic/
│   │   ├── marksheet/
│   │   ├── favorites/
│   │   ├── notifications/
│   │   ├── profile/
│   │   └── subscriptions/
│   ├── (public)/               # Public route group
│   │   ├── job-circular/
│   │   ├── routines/
│   │   └── syllabus/
│   └── api/                    # API routes
├── components/
│   ├── ui/                     # shadcn/ui primitives (24 components)
│   ├── layout/                 # App layout & sidebar
│   ├── admin/                  # Admin-specific shared components
│   └── shared/                 # Cross-cutting shared components
├── features/                   # Feature modules
│   ├── auth/                   # Authentication & authorization
│   ├── dashboard/              # Member dashboard
│   ├── exam-categories/        # Exam category management
│   ├── sub-exam-categories/    # Sub-category management
│   ├── questions/              # Question bank
│   ├── question-sets/          # Question set management
│   ├── routines/               # Exam routines
│   ├── syllabus/               # Syllabus management
│   ├── job-circular/           # Job notifications
│   ├── subscriptions/          # Subscription & packages
│   ├── notifications/          # Notification system
│   ├── members/                # Member management
│   ├── messages/               # Messaging system
│   ├── profile/                # User profile
│   └── settings/               # App settings
├── hooks/                      # Custom React hooks
│   ├── use-cached-fetch.ts     # Data fetching with caching
│   ├── use-filter-params.ts    # URL-based filter state
│   ├── use-mock-auth.ts        # Mock authentication
│   └── use-prefetch-routes.ts  # Route prefetching
├── lib/                        # Core utilities
│   ├── api-client.ts           # HTTP client with auth & timeout
│   ├── store.ts                # Zustand global store
│   ├── utils.ts                # Utility functions
│   └── data/                   # Mock data
├── config/                     # App configuration
│   ├── env.ts                  # Environment variable validation
│   ├── routes.ts               # Centralized route definitions
│   └── navigation.ts          # Navigation menu configuration
├── types/                      # Global type definitions
│   └── index.ts
└── middleware.ts               # Route protection & security headers
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (or pnpm/yarn)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/mojnupust/farhan-mcq-1.git
cd farhan-mcq-1

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

The app will be available at **http://localhost:3000**

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create optimized production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code quality checks |

---

## 🔑 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `USE_MOCKS` | No | `"true"` | Enable mock data (`"true"` / `"false"`) |
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:3000/api` | Backend API base URL |

Environment variables are validated at runtime using Zod schemas (see `src/config/env.ts`).

---

## 🗺️ Routing & Navigation

Routes are centrally defined in `src/config/routes.ts` with type-safe path builders:

```typescript
// Static routes
ROUTES.dashboard        // → "/dashboard"
ROUTES.adminCategories  // → "/admin/categories"

// Dynamic routes (type-safe)
ROUTES.examCategory("bcs")                    // → "/exams/bcs"
ROUTES.subExamDashboard("bcs", "preliminary") // → "/exams/bcs/preliminary"
ROUTES.marksheet("attempt-123")               // → "/marksheet/attempt-123"
```

### Route Groups

| Group | Prefix | Access |
|-------|--------|--------|
| `(public)` | `/` | Everyone |
| `(auth)` | `/login`, `/register` | Unauthenticated users |
| `(member)` | `/dashboard`, `/exam/*` | Authenticated members |
| `(admin)` | `/admin/*` | Admin users only |

---

## 🧠 State Management

### Global Store (Zustand)

The app uses a lightweight Zustand store (`src/lib/store.ts`) for client-side caching:

- **10-minute TTL** cache with automatic expiration
- **Prefix-based invalidation** for grouped cache clearing
- **Zero boilerplate** — no providers or context wrappers needed

### Data Fetching (`useCachedFetch`)

A custom hook that provides:
- ✅ Automatic caching via Zustand store
- ✅ Stale-while-revalidate pattern
- ✅ Request deduplication (prevents duplicate network calls)
- ✅ Loading/error states
- ✅ Manual refetch capability

---

## 🌐 API Integration

The API client (`src/lib/api-client.ts`) provides:

- ******** authentication** — Auto-attaches JWT from localStorage
- **Request timeout** — 15-second timeout with AbortController
- **Structured error handling** — `ApiError` class with status, message, and field-level details
- **Full CRUD methods** — `get`, `post`, `put`, `patch`, `delete`
- **Mock mode** — Seamlessly switch between mock and real API via environment variables

---

## 🎨 UI Components

### shadcn/ui Primitives (24 components)

The project includes a comprehensive set of accessible, customizable UI primitives:

| | | | |
|---|---|---|---|
| Accordion | Alert | Avatar | Badge |
| Breadcrumb | Button | Card | Dialog |
| Dropdown Menu | Input | Label | Progress |
| Select | Separator | Sheet | Skeleton |
| Sonner (Toast) | Switch | Table | Tabs |
| Textarea | Tooltip | Animate In | Loading Skeleton |

### Admin Components

Reusable admin-specific components for consistent admin panel UX:
- `AdminPageHeader` — Page title with action buttons
- `AdminFilterBar` — Search and filter controls
- `AdminStatsBar` — Statistics overview cards
- `AdminEmptyState` — Empty state illustrations
- `ExamSubjectTopicSelects` — Cascading exam/subject/topic selectors

---

## 📦 Feature Modules

Each feature module follows a consistent internal structure:

```
features/<feature-name>/
├── index.ts          # Public barrel exports
├── types.ts          # Feature-specific TypeScript types
├── schemas.ts        # Zod validation schemas
├── components/       # Feature-specific React components
└── services/         # API service functions
```

### Module List

| Module | Description |
|--------|-------------|
| `auth` | Login, registration, onboarding, mock auth |
| `dashboard` | Member home with stats and quick actions |
| `exam-categories` | BCS, Bank, Primary, etc. category management |
| `sub-exam-categories` | Sub-divisions within categories |
| `questions` | Question bank with tagging and filtering |
| `question-sets` | Curated exam sets from question bank |
| `routines` | Exam schedules and calendar |
| `syllabus` | Structured syllabus with HTML viewer |
| `job-circular` | Government job notifications |
| `subscriptions` | Package management and payment flow |
| `notifications` | Push notifications and alerts |
| `members` | User management (admin) |
| `messages` | In-app messaging system |
| `profile` | User profile settings |
| `settings` | Application configuration |

---

## ⚡ Performance Optimizations

| Optimization | Implementation |
|-------------|---------------|
| **Font Loading** | `display: swap` + preload for Hind Siliguri |
| **Image Optimization** | AVIF/WebP formats, responsive sizes, 30-day cache |
| **Static Asset Caching** | Immutable `Cache-Control` headers (1 year) |
| **API Response Caching** | `s-maxage=60`, `stale-while-revalidate=300` |
| **Bundle Optimization** | `optimizePackageImports` for lucide-react, zod |
| **Request Deduplication** | In-flight request map prevents duplicate calls |
| **Client Caching** | 10-minute TTL Zustand store with stale-while-revalidate |
| **Route Prefetching** | Custom `usePrefetchRoutes` hook for anticipated navigation |
| **Compression** | Gzip/Brotli enabled via Next.js config |
| **Route Progress** | Visual loading indicator for route transitions |

---

## 🔒 Security

| Measure | Details |
|---------|---------|
| **Middleware Protection** | Route-based access control for member and admin paths |
| **Security Headers** | `X-DNS-Prefetch-Control`, `X-Content-Type-Options`, `Referrer-Policy` |
| **No X-Powered-By** | Removed to prevent framework fingerprinting |
| **Environment Validation** | Zod-based runtime validation prevents misconfiguration |
| **Request Timeout** | 15s AbortController prevents hanging connections |
| **Auth Token Management** | ****** from localStorage with automatic injection |

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code Style

- ESLint with Next.js recommended rules
- TypeScript strict mode enabled
- Tailwind CSS for styling (no inline styles)
- Feature-based module organization
- Zod schemas for all form validation

---

<div align="center">

**Built with ❤️ for Bangladesh's future government officers**

[Report Bug](https://github.com/mojnupust/farhan-mcq-1/issues) · [Request Feature](https://github.com/mojnupust/farhan-mcq-1/issues)

</div>
