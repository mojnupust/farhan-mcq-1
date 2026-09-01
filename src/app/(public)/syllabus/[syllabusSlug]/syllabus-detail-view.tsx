import { SyllabusHtmlViewer } from "@/components/syllabus-html-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { syllabusContentToHtml } from "@/features/syllabus/content";
import type { SyllabusWithCategory } from "@/features/syllabus";
import { looksLikeHtmlContent } from "@/lib/syllabus-html";
import { ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

export function SyllabusDetailView({
  syllabus,
}: {
  syllabus: SyllabusWithCategory;
}) {
  const rawContent = syllabus.content ?? "";
  const isDesignedHtml = looksLikeHtmlContent(rawContent);
  const html = isDesignedHtml ? "" : syllabusContentToHtml(syllabus);
  const category = syllabus.subExamCategoryName;

  return (
    <article className="mx-auto max-w-5xl px-4 py-6 pb-12 sm:px-6 page-enter">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href={ROUTES.syllabus}>
          <ArrowLeft className="mr-2 size-4" />
          সিলেবাস লাইব্রেরি
        </Link>
      </Button>

      <header className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {category && <Badge variant="secondary">{category}</Badge>}
          <Badge variant="outline">সিলেবাস</Badge>
        </div>
        <h1 className="text-xl font-bold leading-snug sm:text-2xl">
          {syllabus.title}
        </h1>
        {syllabus.createdAt && (
          <p className="text-sm text-muted-foreground">
            <time dateTime={syllabus.createdAt}>
              {new Date(syllabus.createdAt).toLocaleDateString("bn-BD", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </p>
        )}
      </header>

      {isDesignedHtml ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <SyllabusHtmlViewer content={rawContent} />
        </div>
      ) : html.trim() ? (
        <div
          className="max-w-none rounded-xl border border-border bg-card px-5 py-5 text-sm leading-relaxed text-card-foreground sm:text-base [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div className="rounded-xl border bg-muted/30 py-12 text-center">
          <BookOpen className="mx-auto mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            এই সিলেবাসের কন্টেন্ট এখনো যোগ করা হয়নি।
          </p>
        </div>
      )}
    </article>
  );
}
