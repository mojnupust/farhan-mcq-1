import { LandingHeader } from "@/components/landing-header";
import { SyllabusLibraryBrowser } from "./syllabus-browser";

const SITE = "https://farhanmcq.com";

function LibraryJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE}/syllabus`,
        name: "পরীক্ষার সিলেবাস | Farhan MCQ",
        description:
          "BCS, NTRCA, ব্যাংক ও সরকারি চাকরির পরীক্ষার সম্পূর্ণ সিলেবাস ও পাঠ্যক্রম।",
        url: `${SITE}/syllabus`,
        inLanguage: "bn",
        isPartOf: {
          "@type": "WebSite",
          name: "Farhan MCQ",
          url: SITE,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "হোম",
            item: SITE,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "সিলেবাস",
            item: `${SITE}/syllabus`,
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

export default function SyllabusPage() {
  return (
    <>
      <LibraryJsonLd />
      <LandingHeader />
      <SyllabusLibraryBrowser />
    </>
  );
}
