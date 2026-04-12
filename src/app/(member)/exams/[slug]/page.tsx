"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExamCategory } from "@/features/exam-categories";
import { examCategoryService } from "@/features/exam-categories";
import type {
  SubExamCategory,
  UserCategorySummary,
} from "@/features/sub-exam-categories";
import { subExamCategoryService } from "@/features/sub-exam-categories";
import { ArrowLeft, ChevronRight, Target, Trophy } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

export default function ExamCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [category, setCategory] = useState<ExamCategory | null>(null);
  const [subCategories, setSubCategories] = useState<SubExamCategory[]>([]);
  const [summary, setSummary] = useState<UserCategorySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [cat, subs] = await Promise.all([
          examCategoryService.getBySlug(slug),
          subExamCategoryService.getByCategorySlug(slug),
        ]);
        setCategory(cat);
        setSubCategories(subs);

        // Try to get user summary (may fail if not authenticated)
        try {
          const s = await subExamCategoryService.getUserSummary(slug);
          if (s.totalQuestionsFaced > 0) {
            setSummary(s);
          }
        } catch {
          // Not authenticated or no data — that's fine
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
              <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-muted-foreground py-12">
            লোড হচ্ছে...
          </p>
        </div>
    );
  }

  if (!category) {
    return (
              <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-muted-foreground py-12">
            ক্যাটাগরি পাওয়া যায়নি
          </p>
        </div>
    );
  }

  return (
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back + Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <span className="text-3xl">{category.icon || "📝"}</span>
              {category.name}
            </h1>
          </div>
        </div>

        {/* User Summary Card */}
        {summary && (
          <Card className="mt-6 bg-linear-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                    <Target className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {summary.totalQuestionsFaced}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      মোট প্রশ্নের সম্মুখীন
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10">
                    <Trophy className="size-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">
                      {summary.totalCorrect}
                    </p>
                    <p className="text-xs text-muted-foreground">সঠিক উত্তর</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sub-Exam List */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold tracking-tight mb-3">
            পরীক্ষার তালিকা
          </h2>
          {subCategories.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  এই ক্যাটাগরিতে এখনো কোনো সাব-ক্যাটাগরি যোগ হয়নি
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {subCategories.map((sub) => (
                <Link key={sub.id} href={`/exams/${slug}/${sub.slug}`}>
                  <Card className="group transition-all hover:shadow-md hover:border-primary/30 cursor-pointer">
                    <CardHeader className="py-4">
                      <div className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-medium group-hover:text-primary transition-colors">
                          {sub.name}
                        </CardTitle>
                        <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}
