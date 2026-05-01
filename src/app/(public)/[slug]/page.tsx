import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { getPublicQuestion } from "@/features/questions/services/question.api";

// ─── ISR: revalidate every hour; never render at request time ──────────────
export const revalidate = 3600;

// ─── Types ─────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ slug: string }>;
}

// ─── SEO Metadata ──────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const question = await getPublicQuestion(slug);
  if (!question) return { title: "Question Not Found" };

  const title = `${question.questionText} — ${question.subject ?? question.examCategoryName} | Farhan MCQ`;
  const description =
    `${question.questionText} — সঠিক উত্তর ও বিস্তারিত ব্যাখ্যা সহ। ` +
    `${question.subExamCategoryName} পরীক্ষার জন্য প্রস্তুত হন।`;

  const canonicalUrl = `https://farhanmcq.com/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
      locale: "bn_BD",
      siteName: "Farhan MCQ",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

// ─── JSON-LD structured data ───────────────────────────────────────────────

function buildJsonLd(question: Awaited<ReturnType<typeof getPublicQuestion>>) {
  if (!question) return null;

  const options: Record<string, string> = {
    A: question.optionA,
    B: question.optionB,
    C: question.optionC,
    D: question.optionD,
  };

  // FAQPage schema so Google shows the answer in rich results
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: question.questionText,
        acceptedAnswer: {
          "@type": "Answer",
          text: `সঠিক উত্তর: (${question.correctAnswer}) ${options[question.correctAnswer]}`,
        },
      },
    ],
  };

  // BreadcrumbList for navigation signals
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "হোম",
        item: "https://farhanmcq.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: question.examCategoryName,
        item: `https://farhanmcq.com/exams/${question.examCategorySlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: question.subExamCategoryName,
        item: `https://farhanmcq.com/exams/${question.examCategorySlug}/${question.subExamCategorySlug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: question.questionText.slice(0, 60),
        item: `https://farhanmcq.com/${question.slug}`,
      },
    ],
  };

  return [faqSchema, breadcrumbSchema];
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default async function QuestionPage({ params }: Props) {
  const { slug } = await params;
  const question = await getPublicQuestion(slug);
  if (!question) notFound();

  const jsonLd = buildJsonLd(question);

  const optionLabels: { key: "A" | "B" | "C" | "D"; text: string }[] = [
    { key: "A", text: question.optionA },
    { key: "B", text: question.optionB },
    { key: "C", text: question.optionC },
    { key: "D", text: question.optionD },
  ];

  const optionLetters: Record<string, string> = {
    A: "ক",
    B: "খ",
    C: "গ",
    D: "ঘ",
  };

  return (
    <>
      {/* JSON-LD injected into <head> via Next.js script tag */}
      {jsonLd?.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          {/* ── Breadcrumb ── */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 text-sm text-muted-foreground"
          >
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href={ROUTES.home} className="hover:underline">
                  হোম
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={ROUTES.examCategory(question.examCategorySlug)}
                  className="hover:underline"
                >
                  {question.examCategoryName}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={ROUTES.subExamDashboard(
                    question.examCategorySlug,
                    question.subExamCategorySlug,
                  )}
                  className="hover:underline"
                >
                  {question.subExamCategoryName}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="truncate max-w-50" aria-current="page">
                {question.questionText.slice(0, 50)}…
              </li>
            </ol>
          </nav>

          {/* ── Meta chips ── */}
          <div className="mb-4 flex flex-wrap gap-2 text-xs">
            {question.subject && (
              <span className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                {question.subject}
              </span>
            )}
            {question.topic && (
              <span className="rounded-full bg-purple-100 px-3 py-1 font-medium text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                {question.topic}
              </span>
            )}
            {question.subTopic && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {question.subTopic}
              </span>
            )}
            {question.frequencyTag && (
              <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                ⭐ {question.frequencyTag}
              </span>
            )}
          </div>

          {/* ── Question text ── */}
          <h1 className="mb-6 text-xl font-bold leading-snug text-foreground sm:text-2xl">
            {question.questionText}
          </h1>

          {/* ── Options ── */}
          <ol className="mb-8 space-y-3" type="A">
            {optionLabels.map(({ key, text }) => {
              const isCorrect = key === question.correctAnswer;
              return (
                <li
                  key={key}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                    isCorrect
                      ? "border-green-400 bg-green-50 font-semibold text-green-900 dark:border-green-600 dark:bg-green-900/20 dark:text-green-200"
                      : "border-border bg-card text-card-foreground"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isCorrect
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {optionLetters[key]}
                  </span>
                  <span>{text}</span>
                  {isCorrect && (
                    <span
                      className="ml-auto shrink-0 text-green-600 dark:text-green-400"
                      aria-label="সঠিক উত্তর"
                    >
                      ✓
                    </span>
                  )}
                </li>
              );
            })}
          </ol>

          {/* ── Explanation ── */}
          {question.explanation && (
            <section aria-labelledby="explanation-heading" className="mb-10">
              <h2
                id="explanation-heading"
                className="mb-3 text-base font-semibold text-foreground"
              >
                ব্যাখ্যা
              </h2>
              <div
                className="prose prose-sm max-w-none rounded-xl border border-border bg-card px-5 py-4 text-card-foreground dark:prose-invert [&_.ex-badge.correct]:rounded-full [&_.ex-badge.correct]:bg-green-100 [&_.ex-badge.correct]:px-3 [&_.ex-badge.correct]:py-1 [&_.ex-badge.correct]:text-green-800 [&_.ex-table]:w-full [&_.ex-table]:border-collapse [&_.ex-table_td]:border [&_.ex-table_td]:border-border [&_.ex-table_td]:px-3 [&_.ex-table_td]:py-2 [&_.ex-table_th]:border [&_.ex-table_th]:border-border [&_.ex-table_th]:bg-muted [&_.ex-table_th]:px-3 [&_.ex-table_th]:py-2 [&_.ex-table_th]:text-left"
                // explanation is admin-authored HTML — safe to render directly

                dangerouslySetInnerHTML={{ __html: question.explanation }}
              />
            </section>
          )}

          {/* ── Exam source ── */}
          <section className="mb-10 rounded-xl border border-border bg-muted/40 px-5 py-4 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">পরীক্ষা:</span>{" "}
              <Link
                href={ROUTES.subExamDashboard(
                  question.examCategorySlug,
                  question.subExamCategorySlug,
                )}
                className="text-primary hover:underline"
              >
                {question.questionSetTitle}
              </Link>
            </p>
          </section>

          {/* ── Related questions ── */}
          {question.relatedQuestions.length > 0 && (
            <section aria-labelledby="related-heading">
              <h2
                id="related-heading"
                className="mb-4 text-base font-semibold text-foreground"
              >
                সম্পর্কিত প্রশ্ন
              </h2>
              <ul className="space-y-2">
                {question.relatedQuestions.map((rq) => (
                  <li key={rq.id}>
                    <Link
                      href={ROUTES.question(rq.slug)}
                      className="flex items-start gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-card-foreground transition-colors hover:bg-muted"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="line-clamp-2">{rq.questionText}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── CTA ── */}
          <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
            <p className="mb-3 text-sm font-medium text-foreground">
              এই বিষয়ের আরও প্রশ্ন অনুশীলন করতে চান?
            </p>
            <Link
              href={ROUTES.subExamDashboard(
                question.examCategorySlug,
                question.subExamCategorySlug,
              )}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {question.subExamCategoryName} পরীক্ষায় অংশ নিন →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
