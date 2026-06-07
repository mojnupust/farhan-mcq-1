// src/app/sitemap.ts
// ─────────────────────────────────────────────────────────────────────────────
//  World-class sitemap for farhanmcq.com
//
//  WHAT THIS COVERS (every public URL in the frontend):
//  ─────────────────────────────────────────────────────
//  Static      /  /roadmap  /routines  /syllabus  /job-circular  /login  /register
//  Roadmap     /roadmap/[roleSlug]                         (9 static slugs)
//  Exam        /exams/[categorySlug]                       → GET /api/v1/exam-categories
//  Sub-exam    /exams/[categorySlug]/[subSlug]             → NEW endpoint (see below)
//  Sub-pages   /exams/[categorySlug]/[subSlug]/{routine,results,archive,merit-list,syllabus}
//  Syllabus    /syllabus/[syllabusSlug]                    → GET /api/v1/syllabuses  (detail/:slug)
//  Questions   /[slug]                                     → GET /api/v1/question-sets/public/slugs (NEW)
//
//  NEW BACKEND ENDPOINTS REQUIRED (see STEP-BY-STEP guide below):
//    GET /api/v1/sub-exam-categories/sitemap   → [{categorySlug, subSlug, updatedAt}]
//    GET /api/v1/question-sets/public/slugs    → [{slug, updatedAt}]
//
//  Place this file at: src/app/sitemap.ts
// ─────────────────────────────────────────────────────────────────────────────

import type { MetadataRoute } from "next";

// ── Config ────────────────────────────────────────────────────────────────────

const BASE_URL = "https://farhanmcq.com";

// NEXT_PUBLIC_API_URL = "https://api.farhanmcq.com/api" (ends with /api)
// We need the root (without /api) so we can call /api/v1/...
const API_ROOT = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.farhanmcq.com/api"
).replace(/\/api$/, "");

// ISR: rebuild the sitemap every 6 hours.
// Matches the cache TTL we'll use on the two new endpoints.
export const revalidate = 21_600;

// ── Static roadmap slugs (src/features/roadmap/roadmap-data.ts) ───────────────

const ROADMAP_SLUGS = [
  "bcs-preliminary",
  "bcs-written-general",
  "ntrca-school-preliminary",
  "primary-teacher",
  "dss-recruitment",
  "bb-assistant-director",
  "probationary-officer",
  "computer-operator",
  "bangladesh-army",
] as const;

// ── Typed shapes (only the fields we need) ────────────────────────────────────

interface ExamCategoryItem {
  slug: string;
  updatedAt?: string;
}

/** Returned by the NEW /api/v1/sub-exam-categories/sitemap endpoint */
interface SubExamSitemapItem {
  categorySlug: string; // parent exam-category slug  e.g. "bcs-exam"
  subSlug: string; // own slug                   e.g. "bcs-preli-2024"
  updatedAt?: string;
}

interface SyllabusItem {
  slug: string;
  updatedAt?: string;
}

/** Returned by the NEW /api/v1/question-sets/public/slugs endpoint.
 *  The backend filters out null slugs before responding, so slug is
 *  always a non-empty string here — no assertion needed on either side. */
interface QuestionSlugItem {
  slug: string;
  updatedAt?: string;
}

// ── Fault-tolerant fetch ───────────────────────────────────────────────────────

async function safeFetch<T>(url: string, label: string): Promise<T[]> {
  try {
    const res = await fetch(url, {
      next: { revalidate },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(`[sitemap] ⚠️  ${label}: HTTP ${res.status} — skipping`);
      return [];
    }

    const json = (await res.json()) as { data: T[] };
    return Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    console.warn(
      `[sitemap] ⚠️  ${label}: ${(err as Error).message} — skipping`,
    );
    return [];
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Fetch all dynamic data in parallel — one network round-trip budget
  const [examCategories, subExamItems, syllabuses, questionSlugs] =
    await Promise.all([
      // Existing endpoint ✅
      safeFetch<ExamCategoryItem>(
        `${API_ROOT}/api/v1/exam-categories`,
        "exam-categories",
      ),
      // NEW endpoint (Step 1 below) ✅
      safeFetch<SubExamSitemapItem>(
        `${API_ROOT}/api/v1/sub-exam-categories/sitemap`,
        "sub-exam-sitemap",
      ),
      // Existing endpoint ✅  — returns all syllabuses (active=true)
      safeFetch<SyllabusItem>(`${API_ROOT}/api/v1/syllabuses`, "syllabuses"),
      // NEW endpoint (Step 2 below) ✅
      safeFetch<QuestionSlugItem>(
        `${API_ROOT}/api/v1/question-sets/public/slugs`,
        "question-slugs",
      ),
    ]);

  // ── 1. Static shell routes ─────────────────────────────────────────────────

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/roadmap`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/routines`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: `${BASE_URL}/syllabus`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/job-circular`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    // Auth pages — crawlable but low-value
    {
      url: `${BASE_URL}/login`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // ── 2. Roadmap detail pages — /roadmap/[roleSlug] ─────────────────────────

  const roadmapRoutes: MetadataRoute.Sitemap = ROADMAP_SLUGS.map(
    (roleSlug) => ({
      url: `${BASE_URL}/roadmap/${roleSlug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }),
  );

  // ── 3. Exam category pages — /exams/[categorySlug] ────────────────────────

  const examCategoryRoutes: MetadataRoute.Sitemap = examCategories.map(
    (cat) => ({
      url: `${BASE_URL}/exams/${cat.slug}`,
      lastModified: cat.updatedAt ? new Date(cat.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }),
  );

  // ── 4. Sub-exam pages — /exams/[categorySlug]/[subSlug] + sub-pages ───────
  //
  //  Each sub-exam generates 6 URLs:
  //    /exams/bcs-exam/bcs-preli-2024                  (dashboard)
  //    /exams/bcs-exam/bcs-preli-2024/routine
  //    /exams/bcs-exam/bcs-preli-2024/results
  //    /exams/bcs-exam/bcs-preli-2024/archive
  //    /exams/bcs-exam/bcs-preli-2024/merit-list
  //    /exams/bcs-exam/bcs-preli-2024/syllabus

  const subExamRoutes: MetadataRoute.Sitemap = subExamItems.flatMap((item) => {
    const base = `${BASE_URL}/exams/${item.categorySlug}/${item.subSlug}`;
    const mod = item.updatedAt ? new Date(item.updatedAt) : now;

    return [
      {
        url: base,
        lastModified: mod,
        changeFrequency: "daily" as const,
        priority: 0.88,
      },
      {
        url: `${base}/routine`,
        lastModified: mod,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      },
      {
        url: `${base}/results`,
        lastModified: mod,
        changeFrequency: "daily" as const,
        priority: 0.65,
      },
      {
        url: `${base}/archive`,
        lastModified: mod,
        changeFrequency: "weekly" as const,
        priority: 0.72,
      },
      {
        url: `${base}/merit-list`,
        lastModified: mod,
        changeFrequency: "daily" as const,
        priority: 0.6,
      },
      {
        url: `${base}/syllabus`,
        lastModified: mod,
        changeFrequency: "monthly" as const,
        priority: 0.65,
      },
    ];
  });

  // ── 5. Syllabus detail pages — /syllabus/[syllabusSlug] ───────────────────
  //
  //  Note: the API returns SyllabusDto which has { slug, updatedAt? }.
  //  The frontend route is /syllabus/[syllabusSlug] (public page).

  const syllabusRoutes: MetadataRoute.Sitemap = syllabuses.map((s) => ({
    url: `${BASE_URL}/syllabus/${s.slug}`,
    lastModified: s.updatedAt ? new Date(s.updatedAt) : now,
    changeFrequency: "monthly" as const,
    priority: 0.62,
  }));

  // ── 6. Public question pages — /[slug] (the SEO catch-all) ───────────────
  //
  //  These are your highest-volume, highest SEO-value pages.
  //  Each question gets its own URL at /{slug} served by:
  //    src/app/(public)/[slug]/page.tsx
  //  Data comes from: GET /api/v1/question-sets/public/question/:slug

  const questionRoutes: MetadataRoute.Sitemap = questionSlugs.map((q) => ({
    url: `${BASE_URL}/${q.slug}`,
    lastModified: q.updatedAt ? new Date(q.updatedAt) : now,
    changeFrequency: "monthly" as const,
    priority: 0.55,
  }));

  // ── Assemble ───────────────────────────────────────────────────────────────

  return [
    ...staticRoutes, //  7 URLs
    ...roadmapRoutes, //  9 URLs
    ...examCategoryRoutes, //  dynamic
    ...subExamRoutes, //  dynamic × 6
    ...syllabusRoutes, //  dynamic
    ...questionRoutes, //  dynamic (largest set)
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCALE NOTE — when questionSlugs exceeds ~48 000
// ─────────────────────────────────────────────────────────────────────────────
//  Google hard-caps sitemaps at 50 000 URLs per file. If your question count
//  grows large, move question routes into a split sitemap:
//
//  src/app/questions/sitemap.ts:
//
//    export async function generateSitemaps() {
//      const total = await getTotalPublicQuestionCount();
//      return Array.from({ length: Math.ceil(total / 50_000) }, (_, i) => ({ id: i }));
//    }
//    export default async function sitemap({ id }: { id: Promise<string> }) {
//      const page = Number(await id);
//      const items = await fetchQuestionSlugsPage(page, 50_000);
//      return items.map(q => ({ url: `${BASE_URL}/${q.slug}`, ... }));
//    }
//  Served at: /questions/sitemap/0.xml, /questions/sitemap/1.xml …
// ─────────────────────────────────────────────────────────────────────────────
