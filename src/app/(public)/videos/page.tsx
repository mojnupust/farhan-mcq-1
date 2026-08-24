import { LandingHeader } from "@/components/landing-header";
import {
  fetchFeaturedVideos,
  fetchPublicVideos,
  VIDEO_SITE_ORIGIN,
} from "@/features/videos/server";
import { VideoLibraryBrowser } from "./video-library-browser";

export const revalidate = 1800;

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
      {
        "@type": "ItemList",
        name: "Farhan MCQ ভিডিও তালিকা",
        itemListElement: titles.map((v, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${VIDEO_SITE_ORIGIN}/videos/${v.id}`,
          name: v.title,
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

export default async function VideosPage() {
  const [featured, list] = await Promise.all([
    fetchFeaturedVideos(),
    fetchPublicVideos({ page: 1, limit: 12, sort: "newest" }),
  ]);

  const listed = [
    ...featured.slice(0, 3),
    ...list.data.filter(
      (v) => !featured.slice(0, 3).some((f) => f.id === v.id),
    ),
  ];

  return (
    <>
      <LibraryJsonLd
        titles={listed.map((v) => ({ id: v.id, title: v.title }))}
      />
      <LandingHeader />
      <VideoLibraryBrowser
        initialFeatured={featured}
        initialVideos={list.data}
        initialTotal={list.total}
        initialTotalPages={list.totalPages}
      />
    </>
  );
}
