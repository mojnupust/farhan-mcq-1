"use client";

import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const [attempt, setAttempt] = useState(0);
  const onStatusChangeRef = useRef(onStatusChange);
  onStatusChangeRef.current = onStatusChange;

  const load = useCallback(() => {
    let url: string | null = null;
    let cancelled = false;

    setObjectUrl(null);
    setError(false);
    onStatusChangeRef.current?.("loading");

    apiClient
      .getBlob(src, refreshKey !== undefined ? `${refreshKey}-${attempt}` : attempt)
      .then((blob) => {
        if (cancelled) return;
        if (blob.type === "application/json" || blob.size < 32) {
          throw new Error("Invalid image response");
        }
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
  }, [src, refreshKey, attempt]);

  useEffect(() => load(), [load]);

  const retry = useCallback(() => {
    setAttempt((n) => n + 1);
  }, []);

  if (error) {
    if (hideErrorPlaceholder) return null;
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 bg-muted/60 p-3 font-hind text-xs text-muted-foreground",
          className,
        )}
        lang="bn"
      >
        <span>ছবি লোড করা যায়নি</span>
        <button
          type="button"
          onClick={retry}
          className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-1 text-xs text-foreground hover:bg-muted"
        >
          <RefreshCw className="size-3" />
          আবার চেষ্টা
        </button>
      </div>
    );
  }

  if (!objectUrl) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted/40",
          className,
        )}
        aria-hidden
      >
        <Loader2 className="size-6 animate-spin text-muted-foreground/70" />
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element -- object URL, next/image can't handle blob: sources
  return (
    <img
      src={objectUrl}
      alt={alt}
      className={className}
      onLoad={() => onStatusChangeRef.current?.("loaded")}
      onError={() => {
        setError(true);
        onStatusChangeRef.current?.("error");
      }}
    />
  );
}
