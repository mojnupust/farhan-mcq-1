import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { YoutubePlayer } from "@/features/videos/components/youtube-player";
import {
  categoryLabel,
  formatRelativeDate,
  formatViewCount,
} from "@/features/videos/constants";
import type { Video } from "@/features/videos/types";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { VideoDetailInteractive } from "./video-detail-interactive";

export function VideoDetailView({ video }: { video: Video }) {
  const tags = video.tags ?? [];

  return (
    <article className="mx-auto max-w-5xl px-4 py-6 pb-12 sm:px-6 page-enter">
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
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((t) => (
              <Badge key={t} variant="outline" className="text-xs">
                #{t}
              </Badge>
            ))}
          </div>
        )}
      </header>

      <div className="mt-4">
        <Button variant="outline" size="sm" asChild>
          <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer">
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

      <VideoDetailInteractive videoId={video.id} initialVideo={video} />
    </article>
  );
}
