import { LandingHeader } from "@/components/landing-header";
import { ROUTES } from "@/config/routes";
import type { PublicQuestionDto } from "@/features/questions";
import { publicMcqUrl } from "@/features/questions/server";
import { sanitizeHtml } from "@/lib/sanitize";
import Link from "next/link";

const OPTION_LETTERS: Record<string, string> = {
  A: "ক",
  B: "খ",
  C: "গ",
  D: "ঘ",
};

export function PublicQuestionView({
  question,
}: {
  question: PublicQuestionDto;
}) {
  const optionLabels: { key: "A" | "B" | "C" | "D"; text: string }[] = [
    { key: "A", text: question.optionA },
    { key: "B", text: question.optionB },
    { key: "C", text: question.optionC },
    { key: "D", text: question.optionD },
  ];
  const related = question.relatedQuestions ?? [];
  const canonicalUrl = publicMcqUrl(question.slug);

  return (
    <>
      <LandingHeader />
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
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
                <Link href="/mcq" className="hover:underline">
                  MCQ
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
            </ol>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <article itemScope itemType="https://schema.org/Quiz">
              <link itemProp="url" href={canonicalUrl} />

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

              <h1
                itemProp="name"
                className="mb-6 text-xl font-bold leading-snug text-foreground sm:text-2xl"
              >
                {question.questionText}
              </h1>

              <ol className="mb-8 space-y-3">
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
                        {OPTION_LETTERS[key]}
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

              {question.explanation && (
                <section aria-labelledby="explanation-heading" className="mb-10">
                  <h2
                    id="explanation-heading"
                    className="mb-3 text-base font-semibold text-foreground"
                  >
                    ব্যাখ্যা
                  </h2>
                  <div
                    className="max-w-none rounded-xl border border-border bg-card px-5 py-4 text-sm leading-relaxed text-card-foreground [&_p]:mb-2 [&_table]:w-full [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(question.explanation),
                    }}
                  />
                </section>
              )}

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

              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center lg:hidden">
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
            </article>

            <aside className="space-y-6">
              {related.length > 0 && (
                <section aria-labelledby="related-heading">
                  <h2
                    id="related-heading"
                    className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    সম্পর্কিত প্রশ্ন
                  </h2>
                  <ul className="space-y-2">
                    {related.map((rq) => (
                      <li key={rq.id}>
                        <Link
                          href={ROUTES.question(rq.slug)}
                          className="block rounded-lg border border-border bg-card px-3 py-3 text-sm text-card-foreground transition-colors hover:border-primary/40 hover:bg-muted"
                        >
                          <span className="line-clamp-3">{rq.questionText}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="hidden rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center lg:block">
                <p className="mb-3 text-sm font-medium text-foreground">
                  আরও MCQ অনুশীলন করুন
                </p>
                <Link
                  href={ROUTES.subExamDashboard(
                    question.examCategorySlug,
                    question.subExamCategorySlug,
                  )}
                  className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  {question.subExamCategoryName} →
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
