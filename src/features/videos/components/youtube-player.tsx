"use client";

import { cn } from "@/lib/utils";
import { youtubeEmbedUrl } from "../constants";

interface YoutubePlayerProps {
  videoId: string;
  title: string;
  className?: string;
}

export function YoutubePlayer({ videoId, title, className }: YoutubePlayerProps) {
  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-lg",
        className,
      )}
    >
      <iframe
        src={youtubeEmbedUrl(videoId)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
