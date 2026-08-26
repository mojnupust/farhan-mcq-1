import { LandingHeader } from "@/components/landing-header";
import { PDF_SITE_ORIGIN } from "@/features/pdfs/server";
import { PdfLibraryBrowser } from "./pdf-library-browser";

function LibraryJsonLd() {
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
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function PdfLibraryPage() {
  return (
    <>
      <LibraryJsonLd />
      <LandingHeader />
      <PdfLibraryBrowser />
    </>
  );
}
