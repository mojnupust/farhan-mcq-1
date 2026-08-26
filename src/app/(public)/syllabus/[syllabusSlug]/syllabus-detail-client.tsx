"use client";

import { ContentSkeleton } from "@/components/ui/loading-skeleton";
import type { SyllabusWithCategory } from "@/features/syllabus";
import { syllabusService } from "@/features/syllabus";
import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { SyllabusDetailView } from "./syllabus-detail-view";

export function SyllabusDetailClient({ slug }: { slug: string }) {
  const [syllabus, setSyllabus] = useState<SyllabusWithCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    syllabusService
      .getBySlug(slug)
      .then((data) => {
        if (!cancelled) setSyllabus(data);
      })
      .catch(() => {
        if (!cancelled) setSyllabus(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <ContentSkeleton />
      </div>
    );
  }

  if (!syllabus) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <BookOpen className="mx-auto mb-3 size-10 text-muted-foreground/50" />
        <p className="text-muted-foreground">সিলেবাস পাওয়া যায়নি</p>
      </div>
    );
  }

  return <SyllabusDetailView syllabus={syllabus} />;
}
