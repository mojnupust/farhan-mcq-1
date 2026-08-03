"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/config/routes";
import {
  categoryLabel,
  formatDuration,
  formatRelativeDate,
  formatViewCount,
} from "@/features/videos/constants";
import type { Video } from "@/features/videos/types";
import { cn } from "@/lib/utils";
import { Clock, MessageCircle, Play, ThumbsUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface VideoCardProps {
  video: Video;
  variant?: "grid" | "featured";
  className?: string;
}

export function VideoCard({ video, variant = "grid", className }: VideoCardProps) {
  const thumb =
    video.thumbnailUrl ??
    `https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`;
  const duration = formatDuration(video.durationSec);

  return (
    <Link href={ROUTES.videoDetail(video.id)} className={cn("block group", className)}>
      <Card
        className={cn(
          "overflow-hidden border transition-all duration-300 hover:border-primary/40 hover:shadow-lg",
          variant === "featured" && "bg-gradient-to-br from-card to-muted/30",
        )}
      >
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={thumb}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/90 text-primary-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              <Play className="ml-0.5 size-5 fill-current" />
            </div>
          </div>
          {duration && (
            <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-xs font-medium text-white">
              {duration}
            </span>
          )}
          {video.isFeatured && (
            <Badge className="absolute left-2 top-2 bg-amber-500 text-white hover:bg-amber-500">
              ফিচার্ড
            </Badge>
          )}
        </div>
        <CardContent className="p-3 sm:p-4">
          <Badge variant="secondary" className="mb-2 text-xs font-normal">
            {categoryLabel(video.category)}
          </Badge>
          <h3
            className={cn(
              "line-clamp-2 font-semibold leading-snug text-foreground group-hover:text-primary",
              variant === "featured" ? "text-base sm:text-lg" : "text-sm sm:text-base",
            )}
          >
            {video.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {formatRelativeDate(video.publishedAt)}
            </span>
            <span>{formatViewCount(video.viewCount)} দেখা</span>
            <span className="inline-flex items-center gap-1">
              <ThumbsUp className="size-3" />
              {video.likeCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="size-3" />
              {video.commentCount}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
