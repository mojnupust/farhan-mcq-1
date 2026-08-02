"use client";

import { Button } from "@/components/ui/button";
import { ContentSkeleton } from "@/components/ui/loading-skeleton";
import { ROUTES } from "@/config/routes";
import { SlidePreviewCard } from "@/features/slides/components/slide-preview-card";
import { slideService, type QuestionSetSlidesResult } from "@/features/slides";
import { apiClient } from "@/lib/api-client";
import { downloadBlob } from "@/lib/download-blob";
import { toastSuccessAfterCommit, toastErrorAfterCommit } from "@/lib/safe-toast";
import { ArrowLeft, Download, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function ImagesPreviewPage({
  params,
}: {
  params: Promise<{ questionSetId: string }>;
}) {
  const { questionSetId } = use(params);
  const [data, setData] = useState<QuestionSetSlidesResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [imageVersions, setImageVersions] = useState<Record<string, number>>({});

  const loadSlides = useCallback(async () => {
    setLoading(true);
    try {
      const result = await slideService.getByQuestionSetId(questionSetId);
      setData(result);
    } catch {
      setData(null);
      toast.error("স্লাইড লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }, [questionSetId]);

  useEffect(() => {
    loadSlides();
  }, [loadSlides]);

  function handleSlideUpdated(slideId: string, version: number) {
    setImageVersions((prev) => ({
      ...prev,
      [slideId]: version,
    }));
  }

  async function downloadZip() {
    setDownloadingZip(true);
    let ok = false;
    try {
      const blob = await apiClient.getBlob(
        slideService.zipPath(questionSetId, data?.styleConfig.id),
      );
      downloadBlob(blob, `${questionSetId}-slides.zip`);
      ok = true;
    } catch {
      toastErrorAfterCommit("ZIP ডাউনলোড ব্যর্থ হয়েছে");
    } finally {
      setDownloadingZip(false);
      if (ok) toastSuccessAfterCommit("সব স্লাইড ZIP-এ ডাউনলোড হয়েছে");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <ContentSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8 page-enter">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={ROUTES.images}>
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">তৈরি হওয়া স্লাইড</h1>
          <p className="text-sm text-muted-foreground">
            {data?.slides.length ?? 0}টি স্লাইড — এডিট, ডাউনলোড ও শেয়ার
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Button variant="outline" size="sm" onClick={loadSlides}>
            <RefreshCw className="mr-2 size-4" />
            রিফ্রেশ
          </Button>
          {data && data.slides.length > 0 && (
            <Button onClick={downloadZip} disabled={downloadingZip} className="flex-1 sm:flex-none">
              {downloadingZip ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  ZIP তৈরি হচ্ছে...
                </>
              ) : (
                <>
                  <Download className="mr-2 size-4" />
                  সব ডাউনলোড (.zip)
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {!data || data.slides.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <p className="text-muted-foreground">
            এই প্রশ্নসেটের জন্য এখনো কোনো স্লাইড তৈরি হয়নি।
          </p>
          <Button asChild className="mt-4">
            <Link href={ROUTES.images}>স্লাইড তৈরি করুন</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.slides.map((slide) => (
            <SlidePreviewCard
              key={slide.id}
              slide={slide}
                imageVersion={imageVersions[slide.id] ?? slide.updatedAt}
              onSlideUpdated={handleSlideUpdated}
            />
          ))}
        </div>
      )}

      {/* Mobile sticky zip download */}
      {data && data.slides.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur sm:hidden">
          <Button onClick={downloadZip} disabled={downloadingZip} className="w-full">
            {downloadingZip ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                ZIP তৈরি হচ্ছে...
              </>
            ) : (
              <>
                <Download className="mr-2 size-4" />
                সব ডাউনলোড (.zip)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
