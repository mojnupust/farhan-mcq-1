import type { Metadata } from "next";
import Link from "next/link";

import { PUBLIC_PAGE_WIDTH } from "@/components/public-page";
import { ROUTES } from "@/config/routes";
import { getServerApiBase } from "@/lib/server-api-base";

export const metadata: Metadata = {
  title: "MCQ প্রশ্ন ও উত্তর",
  description:
    "BCS, NTRCA, ব্যাংক ও সরকারি চাকরির MCQ প্রশ্ন, সঠিক উত্তর ও ব্যাখ্যা — Farhan MCQ।",
  alternates: { canonical: "https://www.farhanmcq.com/mcq" },
};

interface ExamCategoryItem {
  slug: string;
  name: string;
  icon: string | null;
}

// Server-rendered so Googlebot can follow these links without executing JS —
// this is the only crawlable path from the homepage down into /exams/*.
async function fetchExamCategories(): Promise<ExamCategoryItem[]> {
  try {
    const res = await fetch(`${getServerApiBase()}/v1/exam-categories`, {
      next: { revalidate: 21600 },
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: ExamCategoryItem[] };
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

export default async function McqIndexPage() {
  const categories = await fetchExamCategories();

  return (
    <div className={`${PUBLIC_PAGE_WIDTH} py-12`}>
      <h1 className="text-2xl font-semibold">MCQ প্রশ্নব্যাংক</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        পরীক্ষা নির্বাচন করে অনুশীলন শুরু করুন। প্রতিটি প্রশ্নের আলাদা পাতা
        Google-এ ইনডেক্সের জন্য তৈরি।
      </p>

      {categories.length > 0 && (
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={ROUTES.examCategory(c.slug)}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-card-foreground transition-colors hover:border-primary/40 hover:bg-muted"
              >
                <span>{c.icon ?? "📝"}</span>
                <span>{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={ROUTES.exams}
        className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        পরীক্ষা বেছে নিন →
      </Link>
    </div>
  );
}
