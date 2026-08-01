"use client";

import { AnimateIn } from "@/components/ui/animate-in";
import { Button } from "@/components/ui/button";
import { ContentSkeleton } from "@/components/ui/loading-skeleton";
import { AuthorizedImage } from "@/components/shared/authorized-image";
import { ROUTES } from "@/config/routes";
import { apiClient } from "@/lib/api-client";
import { slideService, type QuestionSetSlidesResult } from "@/features/slides";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

// Minimal placeholder — Phase 6 replaces this with the full responsive preview grid,
// per-slide edit/download actions, and native share support.
export default function ImagesPreviewPage({
  params,
}: {
  params: Promise<{ questionSetId: string }>;
}) {
  const { questionSetId } = use(params);
  const [data, setData] = useState<QuestionSetSlidesResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    slideService
      .getByQuestionSetId(questionSetId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [questionSetId]);

  async function downloadZip() {
    const blob = await apiClient.getBlob(slideService.zipPath(questionSetId));
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${questionSetId}-slides.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadSlide(slideId: string, order: number) {
    const blob = await apiClient.getBlob(slideService.downloadPath(slideId));
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${String(order).padStart(4, "0")}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <ContentSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 page-enter">
      <AnimateIn variant="fade-up" duration={400}>
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.images}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">তৈরি হওয়া স্লাইড</h1>
            <p className="text-sm text-muted-foreground">
              {data?.slides.length ?? 0}টি স্লাইড
            </p>
          </div>
          {data && data.slides.length > 0 && (
            <Button onClick={downloadZip} variant="outline">
              <Download className="mr-2 size-4" />
              সব ডাউনলোড (.zip)
            </Button>
          )}
        </div>

        {!data || data.slides.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            এই প্রশ্নসেটের জন্য এখনো কোনো স্লাইড তৈরি হয়নি।
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.slides.map((slide) => (
              <div key={slide.id} className="space-y-2 rounded-lg border p-2">
                <AuthorizedImage
                  src={slideService.downloadPath(slide.id)}
                  alt={`স্লাইড ${slide.order}`}
                  className="aspect-square w-full rounded-md object-cover"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">#{slide.order}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => downloadSlide(slide.id, slide.order)}
                  >
                    <Download className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AnimateIn>
    </div>
  );
}
