import { LandingHeader } from "@/components/landing-header";
import {
  fetchFeaturedPdfs,
  fetchPublicPdfs,
  PDF_REVALIDATE_SECONDS,
  PDF_SITE_ORIGIN,
} from "@/features/pdfs/server";
import { PdfLibraryBrowser } from "./pdf-library-browser";

export const revalidate = PDF_REVALIDATE_SECONDS;

function LibraryJsonLd({
  titles,
}: {
  titles: { id: string; title: string }[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${PDF_SITE_ORIGIN}/pdf-library`,
        name: "পিডিএফ লাইব্রেরি | Farhan MCQ",
        description:
          "BCS, NTRCA, ব্যাংক ও সরকারি চাকরির সিলেবাস, প্রশ্নব্যাংক, বিগত প্রশ্ন ও নোট PDF।",
        url: `${PDF_SITE_ORIGIN}/pdf-library`,
        inLanguage: "bn",
        isPartOf: {
          "@type": "WebSite",
          name: "Farhan MCQ",
          url: PDF_SITE_ORIGIN,
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
        ],
      },
      {
        "@type": "ItemList",
        name: "Farhan MCQ পিডিএফ তালিকা",
        itemListElement: titles.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${PDF_SITE_ORIGIN}/pdf-library/${p.id}`,
          name: p.title,
        })),
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

export default async function PdfLibraryPage() {
  const [featured, list] = await Promise.all([
    fetchFeaturedPdfs(),
    fetchPublicPdfs({ page: 1, limit: 12, sort: "newest" }),
  ]);

  const listed = [
    ...featured.slice(0, 3),
    ...list.data.filter((p) => !featured.slice(0, 3).some((f) => f.id === p.id)),
  ];

  return (
    <>
      <LibraryJsonLd
        titles={listed.map((p) => ({ id: p.id, title: p.title }))}
      />
      <LandingHeader />
      <PdfLibraryBrowser
        initialFeatured={featured}
        initialPdfs={list.data}
        initialTotal={list.total}
        initialTotalPages={list.totalPages}
      />
    </>
  );
}
