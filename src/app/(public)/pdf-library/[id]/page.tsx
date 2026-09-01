import { docTypeLabel } from "@/features/pdfs/constants";
import {
  fetchPublicPdfById,
  PDF_SITE_ORIGIN,
  pdfCanonicalUrl,
  pdfSeoDescription,
} from "@/features/pdfs/server";
import {
  subExamCategoryLabel,
} from "@/features/pdfs/constants";
import {
  subExamCategoryService,
  type SubExamCategory,
} from "@/features/sub-exam-categories";
import type { Metadata } from "next";
import { PdfDetailClient } from "./pdf-detail-client";
import { PdfDetailView } from "./pdf-detail-view";

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

  let categories: SubExamCategory[] = [];
  if (pdf) {
    try {
      categories = await subExamCategoryService.getAll();
    } catch {
      categories = [];
    }
  }

  const categoryName = pdf
    ? subExamCategoryLabel(pdf.subExamCategoryId, categories)
    : "";

  return (
    <>
      {pdf && <PdfJsonLd pdf={pdf} categoryName={categoryName} />}
      {pdf ? (
        <PdfDetailView pdf={pdf} categoryName={categoryName} />
      ) : (
        <PdfDetailClient id={id} />
      )}
    </>
  );
}
