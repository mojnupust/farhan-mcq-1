"use client";

import {
  AuthorizedImage,
  type AuthorizedImageStatus,
} from "@/components/shared/authorized-image";
import { Button } from "@/components/ui/button";
import { slideService, type Slide } from "@/features/slides";
import { apiClient } from "@/lib/api-client";
import { downloadBlob } from "@/lib/download-blob";
import { shareOrDownloadImage } from "@/lib/share-image";
import { toastSuccessAfterCommit, toastErrorAfterCommit } from "@/lib/safe-toast";
import { cn } from "@/lib/utils";
import { Download, Loader2, Pencil, RefreshCw, Share2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { SlideEditDialog } from "./slide-edit-dialog";
import { SlideTextPreview } from "./slide-text-preview";
import { getSlidePreviewSnippet } from "@/features/slides/utils/slide-text";

interface SlidePreviewCardProps {
  slide: Slide;
  imageVersion: number;
  onSlideUpdated: (slide: Slide) => void;
}

export function SlidePreviewCard({
  slide,
  imageVersion,
  onSlideUpdated,
}: SlidePreviewCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [imageStatus, setImageStatus] = useState<AuthorizedImageStatus>("loading");

  const refreshKey = imageVersion;
  const snippet = useMemo(
    () => getSlidePreviewSnippet(slide.sceneJson),
    [slide.sceneJson],
  );
  const showTextPreview = imageStatus === "loading";
  const showImageError = imageStatus === "error";

  const [imageRetry, setImageRetry] = useState(0);

  useEffect(() => {
    setImageStatus("loading");
  }, [refreshKey, imageRetry]);

  async function fetchSlideBlob() {
    const blob = await apiClient.getBlob(
      slideService.downloadPath(slide.id),
      `${imageVersion}-${imageRetry}`,
    );
    if (blob.type === "application/json" || blob.size < 32) {
      throw new Error("Invalid slide image response");
    }
    return blob;
  }

  async function downloadSlide() {
    setDownloading(true);
    let ok = false;
    try {
      const blob = await fetchSlideBlob();
      downloadBlob(blob, `${String(slide.order).padStart(4, "0")}.png`);
      ok = true;
    } catch {
      toastErrorAfterCommit("ডাউনলোড ব্যর্থ হয়েছে");
    } finally {
      setDownloading(false);
      if (ok) toastSuccessAfterCommit(`স্লাইড #${slide.order} ডাউনলোড হয়েছে`);
    }
  }

  async function shareSlide() {
    setSharing(true);
    try {
      const blob = await fetchSlideBlob();
      const filename = `${String(slide.order).padStart(4, "0")}.png`;
      const result = await shareOrDownloadImage(
        blob,
        filename,
        `Farhan MCQ — স্লাইড ${slide.order}`,
      );
      if (result === "shared") {
        toastSuccessAfterCommit("শেয়ার করা হয়েছে");
      } else {
        toastSuccessAfterCommit("ডাউনলোড হয়েছে — এখন শেয়ার করতে পারেন");
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      toastErrorAfterCommit("শেয়ার করা যায়নি");
    } finally {
      setSharing(false);
    }
  }

  const busy = downloading || sharing;

  return (
    <>
      <div
        className="group overflow-hidden rounded-xl border bg-card font-slide-mixed shadow-sm transition-shadow hover:shadow-md"
        lang="bn"
      >
        <div className="relative bg-muted/30">
          <div className="relative aspect-square w-full">
            <SlideTextPreview
              scene={slide.sceneJson}
              className={cn(
                "absolute inset-0 h-full w-full",
                imageStatus === "loaded" && "pointer-events-none opacity-0",
              )}
            />
            {showImageError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/80 p-4 text-center">
                <p className="text-sm text-muted-foreground">ছবি লোড হয়নি</p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 font-slide-mixed"
                  onClick={() => setImageRetry((n) => n + 1)}
                >
                  <RefreshCw className="mr-1 size-3.5" />
                  আবার চেষ্টা
                </Button>
              </div>
            ) : null}
            <AuthorizedImage
              src={slideService.downloadPath(slide.id)}
              alt={`স্লাইড ${slide.order}`}
              refreshKey={`${refreshKey}-${imageRetry}`}
              hideErrorPlaceholder
              onStatusChange={setImageStatus}
              className={cn(
                "absolute inset-0 h-full w-full object-contain transition-opacity duration-200",
                showTextPreview || showImageError ? "opacity-0" : "opacity-100",
              )}
            />
          </div>
          <div
            className={cn(
              "absolute inset-0 flex items-end justify-center gap-2 bg-gradient-to-t from-black/50 to-transparent p-3",
              "opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
              "max-sm:opacity-100 max-sm:from-black/40",
            )}
          >
            <Button
              size="sm"
              variant="secondary"
              className="h-8 font-slide-mixed shadow-md"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="mr-1 size-3.5" />
              এডিট
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 font-slide-mixed shadow-md"
              onClick={downloadSlide}
              disabled={busy}
            >
              {downloading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <>
                  <Download className="mr-1 size-3.5" />
                  PNG
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 font-slide-mixed shadow-md"
              onClick={shareSlide}
              disabled={busy}
            >
              {sharing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <>
                  <Share2 className="mr-1 size-3.5" />
                  শেয়ার
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="flex items-start justify-between gap-2 border-t px-3 py-2">
          <span className="shrink-0 text-sm font-medium text-muted-foreground">
            #{slide.order}
          </span>
          {snippet ? (
            <p
              className="line-clamp-2 min-w-0 text-left text-xs leading-snug text-foreground/80 sm:text-sm"
              title={snippet}
            >
              {snippet}
            </p>
          ) : null}
        </div>
      </div>

      <SlideEditDialog
        slide={slide}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={(updated) => onSlideUpdated(updated)}
      />
    </>
  );
}
