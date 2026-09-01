import { syllabusPlainText } from "@/features/syllabus/content";
import {
  fetchPublicSyllabusBySlug,
  fetchPublicSyllabuses,
  SYLLABUS_SITE_ORIGIN,
  syllabusCanonicalUrl,
  syllabusSeoDescription,
} from "@/features/syllabus/server";
import type { Metadata } from "next";
import { SyllabusDetailClient } from "./syllabus-detail-client";
import { SyllabusDetailView } from "./syllabus-detail-view";

export const revalidate = 1800;
export const dynamicParams = true;

interface Props {
  params: Promise<{ syllabusSlug: string }>;
}

export async function generateStaticParams() {
  const items = await fetchPublicSyllabuses();
  return items.map((s) => ({ syllabusSlug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { syllabusSlug } = await params;
  const syllabus = await fetchPublicSyllabusBySlug(syllabusSlug);

  if (!syllabus) {
    return {
      title: "সিলেবাস পাওয়া যায়নি",
      robots: { index: false, follow: true },
    };
  }

  const category = syllabus.subExamCategoryName ?? "পরীক্ষা";
  const title = `${syllabus.title} — সিলেবাস`;
  const description = syllabusSeoDescription(syllabus);
  const canonicalUrl = syllabusCanonicalUrl(syllabus.slug);
  const keywords = [
    syllabus.title,
    `${syllabus.title} সিলেবাস`,
    `${category} সিলেবাস`,
    `${category} পাঠ্যক্রম`,
    "BCS সিলেবাস",
    "সরকারি চাকরির সিলেবাস",
    "Farhan MCQ",
  ].filter(Boolean);

  return {
    title,
    description,
    keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${syllabus.title} | Farhan MCQ সিলেবাস`,
      description,
      url: canonicalUrl,
      type: "article",
      locale: "bn_BD",
      siteName: "Farhan MCQ",
      publishedTime: syllabus.createdAt,
    },
    twitter: {
      card: "summary",
      title: `${syllabus.title} | Farhan MCQ`,
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

function SyllabusJsonLd({
  syllabus,
}: {
  syllabus: NonNullable<Awaited<ReturnType<typeof fetchPublicSyllabusBySlug>>>;
}) {
  const canonicalUrl = syllabusCanonicalUrl(syllabus.slug);
  const description = syllabusSeoDescription(syllabus);
  const category = syllabus.subExamCategoryName ?? "সরকারি চাকরি";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        "@id": canonicalUrl,
        name: syllabus.title,
        headline: syllabus.title,
        description,
        url: canonicalUrl,
        inLanguage: "bn",
        learningResourceType: "Syllabus",
        educationalLevel: category,
        text: syllabusPlainText(syllabus.content, syllabus.contentType).slice(
          0,
          8000,
        ),
        isAccessibleForFree: true,
        datePublished: syllabus.createdAt,
        about: {
          "@type": "Thing",
          name: category,
        },
        publisher: {
          "@type": "Organization",
          name: "Farhan MCQ",
          url: SYLLABUS_SITE_ORIGIN,
        },
        isPartOf: {
          "@type": "WebSite",
          name: "Farhan MCQ",
          url: SYLLABUS_SITE_ORIGIN,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "হোম",
            item: SYLLABUS_SITE_ORIGIN,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "সিলেবাস",
            item: `${SYLLABUS_SITE_ORIGIN}/syllabus`,
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

export default async function SyllabusDetailPage({ params }: Props) {
  const { syllabusSlug } = await params;
  const syllabus = await fetchPublicSyllabusBySlug(syllabusSlug);

  return (
    <>
      {syllabus && <SyllabusJsonLd syllabus={syllabus} />}
      {syllabus ? (
        <SyllabusDetailView syllabus={syllabus} />
      ) : (
        <SyllabusDetailClient slug={syllabusSlug} />
      )}
    </>
  );
}
