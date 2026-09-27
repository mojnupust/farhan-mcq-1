import type { Metadata } from "next";

import {
  fetchPublicQuestionBySlug,
  publicMcqUrl,
  QUESTION_SITE_ORIGIN,
} from "@/features/questions/server";
import { PublicQuestionClient } from "./question-client";
import { PublicQuestionView } from "./question-view";

export const revalidate = 3600;
export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

function seoDescription(question: NonNullable<
  Awaited<ReturnType<typeof fetchPublicQuestionBySlug>>
>): string {
  const exam = question.subExamCategoryName || question.examCategoryName;
  const subject = question.subject ? `${question.subject} — ` : "";
  const raw = `${question.questionText} — ${subject}সঠিক উত্তর ও বিস্তারিত ব্যাখ্যা। ${exam} MCQ প্রস্তুতি | Farhan MCQ`;
  return raw.length > 160 ? `${raw.slice(0, 157)}…` : raw;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const question = await fetchPublicQuestionBySlug(slug);

  if (!question) {
    return {
      title: "প্রশ্ন পাওয়া যায়নি",
      robots: { index: false, follow: true },
    };
  }

  const title = question.questionText;
  const description = seoDescription(question);
  const canonicalUrl = publicMcqUrl(question.slug);
  const keywords = [
    question.questionText,
    question.subject,
    question.topic,
    `${question.subject} MCQ`,
    `${question.subExamCategoryName} প্রশ্ন`,
    "BCS MCQ",
    "সরকারি চাকরি MCQ",
    "Farhan MCQ",
  ].filter((k): k is string => Boolean(k));

  return {
    title,
    description,
    keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${question.questionText} | Farhan MCQ`,
      description,
      url: canonicalUrl,
      type: "article",
      locale: "bn_BD",
      siteName: "Farhan MCQ",
    },
    twitter: {
      card: "summary",
      title: `${question.questionText} | Farhan MCQ`,
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

function QuestionJsonLd({
  question,
}: {
  question: NonNullable<
    Awaited<ReturnType<typeof fetchPublicQuestionBySlug>>
  >;
}) {
  const canonicalUrl = publicMcqUrl(question.slug);
  const options: Record<string, string> = {
    A: question.optionA,
    B: question.optionB,
    C: question.optionC,
    D: question.optionD,
  };
  const correctText = options[question.correctAnswer] ?? "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Quiz",
        "@id": canonicalUrl,
        name: question.questionText,
        url: canonicalUrl,
        inLanguage: "bn",
        educationalLevel: question.subExamCategoryName,
        about: question.subject || question.topic,
        isAccessibleForFree: true,
        hasPart: {
          "@type": "Question",
          name: question.questionText,
          suggestedAnswer: [
            { "@type": "Answer", text: question.optionA },
            { "@type": "Answer", text: question.optionB },
            { "@type": "Answer", text: question.optionC },
            { "@type": "Answer", text: question.optionD },
          ],
          acceptedAnswer: {
            "@type": "Answer",
            text: `সঠিক উত্তর: ${correctText}`,
          },
        },
        publisher: {
          "@type": "Organization",
          name: "Farhan MCQ",
          url: QUESTION_SITE_ORIGIN,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: question.questionText,
            acceptedAnswer: {
              "@type": "Answer",
              text: `সঠিক উত্তর: (${question.correctAnswer}) ${correctText}`,
            },
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "হোম",
            item: QUESTION_SITE_ORIGIN,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "MCQ",
            item: `${QUESTION_SITE_ORIGIN}/mcq`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: question.examCategoryName,
            item: `${QUESTION_SITE_ORIGIN}/exams/${question.examCategorySlug}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: question.questionText.slice(0, 60),
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

export default async function PublicMcqPage({ params }: Props) {
  const { slug } = await params;
  const question = await fetchPublicQuestionBySlug(slug);

  return (
    <>
      {question && <QuestionJsonLd question={question} />}
      {question ? (
        <PublicQuestionView question={question} />
      ) : (
        <PublicQuestionClient slug={slug} />
      )}
    </>
  );
}
