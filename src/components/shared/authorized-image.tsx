"use client";

import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export type AuthorizedImageStatus = "loading" | "loaded" | "error";

interface AuthorizedImageProps {
  /** API path (e.g. "/v1/slides/:slideId/download"), not a full URL */
  src: string;
  alt: string;
  className?: string;
  /** Bump to force a fresh fetch (e.g. after re-render) */
  refreshKey?: string | number;
  /** When true, render nothing on fetch failure (parent can show a text fallback). */
  hideErrorPlaceholder?: boolean;
  onStatusChange?: (status: AuthorizedImageStatus) => void;
}

// Every slide image endpoint is auth-gated, and a plain <img src> can't attach a Bearer
// token — so fetch the bytes via apiClient and render them as an object URL instead.
export function AuthorizedImage({
  src,
  alt,
  className,
  refreshKey,
  hideErrorPlaceholder = false,
  onStatusChange,
}: AuthorizedImageProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;

  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;

    setObjectUrl(null);
    setError(false);
    onStatusChangeRef.current?.("loading");

    apiClient
      .getBlob(src, refreshKey)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setObjectUrl(url);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          onStatusChangeRef.current?.("error");
        }
      });

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [src, refreshKey]);

  if (error) {
    if (hideErrorPlaceholder) return null;
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted font-hind text-xs text-muted-foreground",
          className,
        )}
        lang="bn"
      >
        ছবি লোড করা যায়নি
      </div>
    );
  }

  if (!objectUrl) {
    return <div className={cn("animate-pulse bg-muted/40", className)} aria-hidden />;
  }

  // eslint-disable-next-line @next/next/no-img-element -- object URL, next/image can't handle blob: sources
  return (
    <img
      src={objectUrl}
      alt={alt}
      className={className}
      onLoad={() => onStatusChangeRef.current?.("loaded")}
    />
  );
}
