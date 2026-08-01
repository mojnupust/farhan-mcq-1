"use client";

import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface AuthorizedImageProps {
  /** API path (e.g. "/v1/slides/:slideId/download"), not a full URL */
  src: string;
  alt: string;
  className?: string;
}

// Every slide image endpoint is auth-gated, and a plain <img src> can't attach a Bearer
// token — so fetch the bytes via apiClient and render them as an object URL instead.
export function AuthorizedImage({ src, alt, className }: AuthorizedImageProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;

    apiClient
      .getBlob(src)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setObjectUrl(url);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [src]);

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-xs text-muted-foreground",
          className,
        )}
      >
        ছবি লোড করা যায়নি
      </div>
    );
  }

  if (!objectUrl) {
    return <div className={cn("animate-pulse bg-muted", className)} />;
  }

  // eslint-disable-next-line @next/next/no-img-element -- object URL, next/image can't handle blob: sources
  return <img src={objectUrl} alt={alt} className={className} />;
}
