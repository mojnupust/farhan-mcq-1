"use client";

import { ContentSkeleton } from "@/components/ui/loading-skeleton";
import { videoService } from "@/features/videos";
import type { Video } from "@/features/videos/types";
import { Play } from "lucide-react";
import { useEffect, useState } from "react";
import { VideoDetailView } from "./video-detail-view";

export function VideoDetailClient({ id }: { id: string }) {
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    videoService
      .getById(id)
      .then((data) => {
        if (!cancelled) setVideo(data);
      })
      .catch(() => {
        if (!cancelled) setVideo(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <ContentSkeleton />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
        <Play className="mx-auto mb-3 size-10 text-muted-foreground/50" />
        <p className="text-muted-foreground">ভিডিও পাওয়া যায়নি</p>
      </div>
    );
  }

  return <VideoDetailView video={video} />;
}
