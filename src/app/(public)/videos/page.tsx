import { LandingHeader } from "@/components/landing-header";
import { VIDEO_SITE_ORIGIN } from "@/features/videos/server";
import { VideoLibraryBrowser } from "./video-library-browser";

function LibraryJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${VIDEO_SITE_ORIGIN}/videos`,
        name: "ভিডিও লাইব্রেরি | Farhan MCQ",
        description:
          "BCS, NTRCA, ব্যাংক ও সরকারি চাকরির প্রস্তুতির YouTube লেকচার।",
        url: `${VIDEO_SITE_ORIGIN}/videos`,
        inLanguage: "bn",
        isPartOf: {
          "@type": "WebSite",
          name: "Farhan MCQ",
          url: VIDEO_SITE_ORIGIN,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "হোম",
            item: VIDEO_SITE_ORIGIN,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "ভিডিও লাইব্রেরি",
            item: `${VIDEO_SITE_ORIGIN}/videos`,
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

export default function VideosPage() {
  return (
    <>
      <LibraryJsonLd />
      <LandingHeader />
      <VideoLibraryBrowser />
    </>
  );
}
