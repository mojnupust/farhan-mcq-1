import { LandingHeader } from "@/components/landing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  docTypeLabel,
  formatCount,
  formatRelativeDate,
  subExamCategoryLabel,
} from "@/features/pdfs/constants";
import {
  fetchPublicPdfById,
  PDF_SITE_ORIGIN,
  pdfCanonicalUrl,
  pdfSeoDescription,
} from "@/features/pdfs/server";
import {
  subExamCategoryService,
  type SubExamCategory,
} from "@/features/sub-exam-categories";
import { ArrowLeft, Download, Eye } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PdfDetailInteractive } from "./pdf-detail-interactive";

export const revalidate = 1800;
export const dynamicParams = true;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pdf = await fetchPublicPdfById(id);

  if (!pdf) {
    return {
      title: "পিডিএফ পাওয়া যায়নি",
      robots: { index: false, follow: true },
    };
  }

  const typeLabel = docTypeLabel(pdf.docType);
  const title = `${pdf.title} PDF ডাউনলোড`;
  const description = pdfSeoDescription(pdf);
  const canonicalUrl = pdfCanonicalUrl(pdf.id);
  const keywords = [
    pdf.title,
    `${pdf.title} PDF`,
    `${pdf.title} ডাউনলোড`,
    `${typeLabel} PDF`,
    pdf.examName,
    pdf.subject,
    ...(pdf.tags ?? []),
    "BCS PDF",
    "সরকারি চাকরি PDF",
    "Farhan MCQ",
  ].filter((k): k is string => Boolean(k));

  return {
    title,
    description,
    keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${pdf.title} | Farhan MCQ PDF`,
      description,
      url: canonicalUrl,
      type: "article",
      locale: "bn_BD",
      siteName: "Farhan MCQ",
      modifiedTime: pdf.updatedAt,
      publishedTime: pdf.createdAt,
    },
    twitter: {
      card: "summary_large_image",
      title: `${pdf.title} PDF | Farhan MCQ`,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

function PdfJsonLd({
  pdf,
  categoryName,
}: {
  pdf: NonNullable<Awaited<ReturnType<typeof fetchPublicPdfById>>>;
  categoryName: string;
}) {
  const canonicalUrl = pdfCanonicalUrl(pdf.id);
  const description = pdfSeoDescription(pdf);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DigitalDocument",
        "@id": canonicalUrl,
        name: pdf.title,
        headline: pdf.title,
        description,
        url: canonicalUrl,
        encodingFormat: "application/pdf",
        inLanguage: "bn",
        isAccessibleForFree: pdf.isFree,
        dateModified: pdf.updatedAt,
        datePublished: pdf.createdAt,
        keywords: [docTypeLabel(pdf.docType), categoryName, ...(pdf.tags ?? [])]
          .filter(Boolean)
          .join(", "),
        publisher: {
          "@type": "Organization",
          name: "Farhan MCQ",
          url: PDF_SITE_ORIGIN,
        },
        about: {
          "@type": "Thing",
          name: pdf.examName || pdf.subject || categoryName,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "হোম",
            item: PDF_SITE_ORIGIN,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "পিডিএফ লাইব্রেরি",
            item: `${PDF_SITE_ORIGIN}/pdf-library`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: pdf.title,
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

export default async function PdfDetailPage({ params }: Props) {
  const { id } = await params;
  const pdf = await fetchPublicPdfById(id);
  if (!pdf) notFound();

  let categories: SubExamCategory[] = [];
  try {
    categories = await subExamCategoryService.getAll();
  } catch {
    categories = [];
  }

  const categoryName = subExamCategoryLabel(
    pdf.subExamCategoryId,
    categories,
  );

  return (
    <>
      <PdfJsonLd pdf={pdf} categoryName={categoryName} />
      <LandingHeader />
      <article className="mx-auto max-w-4xl px-4 py-6 pb-12 sm:px-6 page-enter">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/pdf-library">
            <ArrowLeft className="mr-2 size-4" />
            পিডিএফ লাইব্রেরি
          </Link>
        </Button>

        <header className="mb-5 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{docTypeLabel(pdf.docType)}</Badge>
            <Badge variant="outline">{categoryName}</Badge>
            {pdf.isFree ? (
              <Badge className="bg-emerald-600 hover:bg-emerald-600">ফ্রি</Badge>
            ) : (
              <Badge variant="secondary">প্রিমিয়াম</Badge>
            )}
          </div>
          <h1 className="text-xl font-bold leading-snug sm:text-2xl">
            {pdf.title}
          </h1>
          <p className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Download className="size-3.5" />
              {formatCount(pdf.downloadCount)} ডাউনলোড
            </span>
            <span className="flex items-center gap-1">
              <Eye className="size-3.5" />
              {formatCount(pdf.viewCount)} দেখা
            </span>
            <time dateTime={pdf.updatedAt}>
              {formatRelativeDate(pdf.updatedAt)}
            </time>
          </p>
          {pdf.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {pdf.tags.map((t) => (
                <Badge key={t} variant="outline" className="text-xs">
                  #{t}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {pdf.description && (
          <div className="mb-5 rounded-xl border bg-muted/30 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {pdf.description}
            </p>
          </div>
        )}

        <PdfDetailInteractive pdfId={id} initialPdf={pdf} />
      </article>
    </>
  );
}
