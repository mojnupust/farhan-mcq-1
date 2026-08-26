"use client";

import { ContentSkeleton } from "@/components/ui/loading-skeleton";
import { pdfService } from "@/features/pdfs";
import { subExamCategoryLabel } from "@/features/pdfs/constants";
import type { PdfDocument } from "@/features/pdfs/types";
import {
  subExamCategoryService,
  type SubExamCategory,
} from "@/features/sub-exam-categories";
import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { PdfDetailView } from "./pdf-detail-view";

export function PdfDetailClient({ id }: { id: string }) {
  const [pdf, setPdf] = useState<PdfDocument | null>(null);
  const [categories, setCategories] = useState<SubExamCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      pdfService.getById(id),
      subExamCategoryService.getAll().catch(() => [] as SubExamCategory[]),
    ])
      .then(([doc, cats]) => {
        if (cancelled) return;
        setPdf(doc);
        setCategories(cats);
      })
      .catch(() => {
        if (!cancelled) setPdf(null);
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
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <ContentSkeleton />
      </div>
    );
  }

  if (!pdf) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <FileText className="mx-auto mb-3 size-10 text-muted-foreground/50" />
        <p className="text-muted-foreground">পিডিএফ পাওয়া যায়নি</p>
      </div>
    );
  }

  return (
    <PdfDetailView
      pdf={pdf}
      categoryName={subExamCategoryLabel(pdf.subExamCategoryId, categories)}
    />
  );
}
