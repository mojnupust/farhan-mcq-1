import {
  categoryLabel,
  youtubeEmbedUrl,
  youtubeThumbnail,
} from "@/features/videos/constants";
import {
  fetchPublicVideoById,
  isoDuration,
  VIDEO_SITE_ORIGIN,
  videoCanonicalUrl,
  videoSeoDescription,
} from "@/features/videos/server";
import type { Metadata } from "next";
import { VideoDetailClient } from "./video-detail-client";
import { VideoDetailView } from "./video-detail-view";

export const revalidate = 1800;
export const dynamicParams = true;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const video = await fetchPublicVideoById(id);

  if (!video) {
    return {
      title: "ভিডিও পাওয়া যায়নি",
      robots: { index: false, follow: true },
    };
  }

  const typeLabel = categoryLabel(video.category);
  const title = `${video.title} — ${typeLabel} ভিডিও`;
  const description = videoSeoDescription(video);
  const canonicalUrl = videoCanonicalUrl(video.id);
  const thumb =
    video.thumbnailUrl ?? youtubeThumbnail(video.youtubeVideoId);
  const keywords = [
    video.title,
    `${video.title} ভিডিও`,
    `${typeLabel} লেকচার`,
    `${typeLabel} ভিডিও ক্লাস`,
    ...(video.tags ?? []),
    "BCS ভিডিও",
    "সরকারি চাকরি প্রস্তুতি",
    "Farhan MCQ",
  ].filter(Boolean);

  return {
    title,
    description,
    keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${video.title} | Farhan MCQ`,
      description,
      url: canonicalUrl,
      type: "video.other",
      locale: "bn_BD",
      siteName: "Farhan MCQ",
      images: [{ url: thumb, width: 480, height: 360, alt: video.title }],
      videos: [
        {
          url: video.youtubeUrl,
          secureUrl: youtubeEmbedUrl(video.youtubeVideoId),
          type: "text/html",
          width: 1280,
          height: 720,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${video.title} | Farhan MCQ`,
      description,
      images: [thumb],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },
  };
}

function VideoJsonLd({ video }: { video: NonNullable<Awaited<ReturnType<typeof fetchPublicVideoById>>> }) {
  const canonicalUrl = videoCanonicalUrl(video.id);
  const description = videoSeoDescription(video);
  const thumb =
    video.thumbnailUrl ?? youtubeThumbnail(video.youtubeVideoId);
  const duration = isoDuration(video.durationSec);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VideoObject",
        "@id": canonicalUrl,
        name: video.title,
        description,
        thumbnailUrl: thumb,
        uploadDate: video.publishedAt || video.createdAt,
        dateModified: video.updatedAt,
        duration,
        embedUrl: youtubeEmbedUrl(video.youtubeVideoId),
        contentUrl: video.youtubeUrl,
        inLanguage: "bn",
        isFamilyFriendly: true,
        publisher: {
          "@type": "Organization",
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
          {
            "@type": "ListItem",
            position: 3,
            name: video.title,
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

export default async function VideoDetailPage({ params }: Props) {
  const { id } = await params;
  const video = await fetchPublicVideoById(id);

  return (
    <>
      {video && <VideoJsonLd video={video} />}
      {video ? <VideoDetailView video={video} /> : <VideoDetailClient id={id} />}
    </>
  );
}
