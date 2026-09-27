"use client";

import { ContentSkeleton } from "@/components/ui/loading-skeleton";
import { LandingHeader } from "@/components/landing-header";
import type { PublicQuestionDto } from "@/features/questions";
import { apiClient } from "@/lib/api-client";
import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { PublicQuestionView } from "./question-view";

export function PublicQuestionClient({ slug }: { slug: string }) {
  const [question, setQuestion] = useState<PublicQuestionDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<{ data: PublicQuestionDto }>(
        `/v1/question-sets/public/question/${encodeURIComponent(slug)}`,
      )
      .then((res) => {
        if (!cancelled) setQuestion(res.data);
      })
      .catch(() => {
        if (!cancelled) setQuestion(null);
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
      <>
        <LandingHeader />
        <div className="mx-auto max-w-4xl px-4 py-8">
          <ContentSkeleton />
        </div>
      </>
    );
  }

  if (!question) {
    return (
      <>
        <LandingHeader />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <BookOpen className="mx-auto mb-3 size-10 text-muted-foreground/50" />
          <p className="text-muted-foreground">প্রশ্ন পাওয়া যায়নি</p>
        </div>
      </>
    );
  }

  return <PublicQuestionView question={question} />;
}
