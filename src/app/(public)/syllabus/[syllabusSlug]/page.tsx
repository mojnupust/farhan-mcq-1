import { LandingHeader } from "@/components/landing-header";
import { SyllabusHtmlViewer } from "@/components/syllabus-html-viewer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SyllabusWithCategory } from "@/features/syllabus";
import { ArrowLeft, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// ─── ISR: revalidate every 30 minutes ─────────────────────────────────────
export const revalidate = 1800;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// ─── Server-side data fetcher ──────────────────────────────────────────────

async function fetchSyllabus(
  slug: string,
): Promise<SyllabusWithCategory | null> {
  try {
    const res = await fetch(`${API_BASE}/v1/syllabuses/detail/${slug}`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data as SyllabusWithCategory;
  } catch {
    return null;
  }
}

// ─── SEO Metadata ──────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ syllabusSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { syllabusSlug } = await params;
  const syllabus = await fetchSyllabus(syllabusSlug);

  if (!syllabus) {
    return {
      title: "সিলেবাস পাওয়া যায়নি | Farhan MCQ",
    };
  }

  const title = `${syllabus.title} — ${syllabus.subExamCategoryName} সিলেবাস | Farhan MCQ`;
  const description =
    `${syllabus.title}: ${syllabus.subExamCategoryName} পরীক্ষার সম্পূর্ণ সিলেবাস ও পাঠ্যক্রম। ` +
    `বিষয়ভিত্তিক টপিক, গুরুত্বপূর্ণ পয়েন্ট ও প্রস্তুতির নির্দেশিকা।`;
  const canonicalUrl = `https://farhanmcq.com/syllabus/${syllabusSlug}`;

  return {
    title,
    description,
    keywords: [
      syllabus.title,
      `${syllabus.subExamCategoryName} সিলেবাস`,
      `${syllabus.subExamCategoryName} পাঠ্যক্রম`,
      "সরকারি চাকরির সিলেবাস",
      "Farhan MCQ",
    ],
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
    robots: {
      index: true,
      follow: true,
    },
  };
}

// ─── JSON-LD Structured Data ───────────────────────────────────────────────

function SyllabusJsonLd({ syllabus }: { syllabus: SyllabusWithCategory }) {
  const canonicalUrl = `https://farhanmcq.com/syllabus/${syllabus.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        "@id": canonicalUrl,
        name: syllabus.title,
        description: `${syllabus.title}: ${syllabus.subExamCategoryName} পরীক্ষার সম্পূর্ণ সিলেবাস।`,
        url: canonicalUrl,
        provider: {
          "@type": "Organization",
          name: "Farhan MCQ",
          url: "https://farhanmcq.com",
        },
        educationalLevel: "Professional Exam Preparation",
        inLanguage: "bn",
        isAccessibleForFree: true,
      },
      {
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
            name: "সিলেবাস",
            item: "https://farhanmcq.com/syllabus",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: syllabus.title,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ─── Content Renderer (same logic as member page) ──────────────────────────

function renderContent(content: string): string {
  let html = content;

  // YouTube embeds
  html = html.replace(
    /!\[youtube\]\((https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)[^)]*)\)/gi,
    (_match, _url, id) =>
      `<div class="my-4 aspect-video"><iframe src="https://www.youtube.com/embed/${id}" class="w-full h-full rounded-lg" frameborder="0" allowfullscreen loading="lazy"></iframe></div>`,
  );
  html = html.replace(
    /\{\{youtube:(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)[^}]*)\}\}/gi,
    (_match, _url, id) =>
      `<div class="my-4 aspect-video"><iframe src="https://www.youtube.com/embed/${id}" class="w-full h-full rounded-lg" frameborder="0" allowfullscreen loading="lazy"></iframe></div>`,
  );

  // Images
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="my-4 max-w-full rounded-lg" loading="lazy" />',
  );

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">$1</a>',
  );

  // Headings
  html = html.replace(
    /^### (.+)$/gm,
    '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>',
  );
  html = html.replace(
    /^## (.+)$/gm,
    '<h2 class="text-xl font-semibold mt-8 mb-3">$1</h2>',
  );
  html = html.replace(
    /^# (.+)$/gm,
    '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>',
  );

  // Bold and Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Unordered list items
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');

  // Ordered list items
  html = html.replace(
    /^\d+\. (.+)$/gm,
    '<li class="ml-4 list-decimal">$1</li>',
  );

  // Wrap consecutive list items
  html = html.replace(
    /(<li class="ml-4 list-disc">[\s\S]*?<\/li>(\n|$))+/g,
    (match) => `<ul class="my-2 space-y-1">${match}</ul>`,
  );
  html = html.replace(
    /(<li class="ml-4 list-decimal">[\s\S]*?<\/li>(\n|$))+/g,
    (match) => `<ol class="my-2 space-y-1">${match}</ol>`,
  );

  // Paragraphs
  html = html
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<li") ||
        trimmed.startsWith("<div") ||
        trimmed.startsWith("<img") ||
        trimmed.startsWith("<a") ||
        trimmed.startsWith("</")
      ) {
        return line;
      }
      return `<p class="my-2">${trimmed}</p>`;
    })
    .join("\n");

  return html;
}

// ─── Page Component ────────────────────────────────────────────────────────

export default async function PublicSyllabusDetailPage({ params }: Props) {
  const { syllabusSlug } = await params;
  const syllabus = await fetchSyllabus(syllabusSlug);

  if (!syllabus) {
    notFound();
  }

  return (
    <>
      <SyllabusJsonLd syllabus={syllabus} />
      <LandingHeader />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <li>
              <Link
                href="/"
                className="hover:text-foreground transition-colors"
              >
                হোম
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href="/syllabus"
                className="hover:text-foreground transition-colors"
              >
                সিলেবাস
              </Link>
            </li>
            <li>/</li>
            <li
              className="text-foreground font-medium truncate max-w-45"
              aria-current="page"
            >
              {syllabus.title}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="shrink-0 mt-0.5"
          >
            <Link href="/syllabus">
              <ArrowLeft className="size-5" />
              <span className="sr-only">সিলেবাস তালিকায় ফিরুন</span>
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="size-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">
                {syllabus.subExamCategoryName}
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {syllabus.title}
            </h1>
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="py-6 prose prose-sm max-w-none">
            {syllabus.contentType === "html" ? (
              <SyllabusHtmlViewer content={syllabus.content} />
            ) : (
              <div
                dangerouslySetInnerHTML={{
                  __html: renderContent(syllabus.content),
                }}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
