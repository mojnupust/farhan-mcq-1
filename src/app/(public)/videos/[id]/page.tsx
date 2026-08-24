import { LandingHeader } from "@/components/landing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { YoutubePlayer } from "@/features/videos/components/youtube-player";
import {
  categoryLabel,
  formatRelativeDate,
  formatViewCount,
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
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoDetailInteractive } from "./video-detail-interactive";

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
  if (!video) notFound();

  return (
    <>
      <VideoJsonLd video={video} />
      <LandingHeader />
      <article className="mx-auto max-w-4xl px-4 py-6 pb-12 sm:px-6 page-enter">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/videos">
            <ArrowLeft className="mr-2 size-4" />
            ভিডিও লাইব্রেরি
          </Link>
        </Button>

        <YoutubePlayer videoId={video.youtubeVideoId} title={video.title} />

        <header className="mt-5 space-y-3">
          <Badge variant="secondary">{categoryLabel(video.category)}</Badge>
          <h1 className="text-xl font-bold leading-snug sm:text-2xl">
            {video.title}
          </h1>
          <p className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{formatViewCount(video.viewCount)} দেখা</span>
            <time dateTime={video.publishedAt ?? video.createdAt}>
              {formatRelativeDate(video.publishedAt)}
            </time>
          </p>
          {video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {video.tags.map((t) => (
                <Badge key={t} variant="outline" className="text-xs">
                  #{t}
                </Badge>
              ))}
            </div>
          )}
        </header>

        <div className="mt-4">
          <Button variant="outline" size="sm" asChild>
            <a
              href={video.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 size-4" />
              YouTube-এ দেখুন
            </a>
          </Button>
        </div>

        {video.description && (
          <div className="mt-5 rounded-xl border bg-muted/30 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {video.description}
            </p>
          </div>
        )}

        <VideoDetailInteractive videoId={id} initialVideo={video} />
      </article>
    </>
  );
}
