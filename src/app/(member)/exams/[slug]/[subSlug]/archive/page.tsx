"use client";

import { AnimateIn } from "@/components/ui/animate-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { ROUTES } from "@/config/routes";
import type { QuestionSet } from "@/features/question-sets";
import { questionSetService } from "@/features/question-sets";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  PlayCircle,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

export default function ArchivePage({
  params,
}: {
  params: Promise<{ slug: string; subSlug: string }>;
}) {
  const { slug, subSlug } = use(params);
  const [sets, setSets] = useState<QuestionSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data =
          await questionSetService.getArchiveBySubCategorySlug(subSlug);
        setSets(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [subSlug]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 page-enter">
      <AnimateIn variant="fade-up" duration={400}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.subExamDashboard(slug, subSlug)}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <span className="text-2xl">📚</span>
              আর্কাইভ
            </h1>
            {!loading && sets.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                মোট {sets.length}টি প্রশ্নসেট
              </p>
            )}
          </div>
        </div>
      </AnimateIn>

      {loading ? (
        <ListSkeleton count={4} />
      ) : sets.length === 0 ? (
        <AnimateIn variant="scale-up" duration={500}>
          <Card className="mt-6">
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto size-12 text-muted-foreground/50 mb-3 animate-float" />
              <p className="text-muted-foreground">
                কোনো আর্কাইভ প্রশ্নসেট নেই
              </p>
            </CardContent>
          </Card>
        </AnimateIn>
      ) : (
        <div className="mt-6 space-y-3">
          {sets.map((set, index) => (
            <AnimateIn
              key={set.id}
              variant="fade-up"
              delay={index * 60}
              duration={450}
            >
              <Card className="group card-hover-lift glow-on-hover transition-all duration-300 hover:border-primary/30 overflow-hidden">
                {/* Subtle top accent */}
                <div className="h-0.5 w-full bg-gradient-to-r from-purple-400/60 via-primary/40 to-blue-400/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate group-hover:text-primary transition-colors duration-200">
                        {set.title}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5 text-purple-500" />
                          {new Date(set.date).toLocaleDateString("bn-BD")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5 text-blue-500" />
                          {set.duration} মিনিট
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-emerald-400 inline-block" />
                          নম্বর: {set.totalMarks}
                        </span>
                      </div>
                      {set.subject && (
                        <Badge
                          variant="secondary"
                          className="mt-2 text-xs bg-purple-50 text-purple-700 border-purple-200/50"
                        >
                          {set.subject}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm active:scale-95 transition-all duration-150"
                        asChild
                      >
                        <Link href={ROUTES.exam(set.id)}>
                          <PlayCircle className="size-3.5 mr-1" />
                          পরীক্ষা দিন
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 active:scale-95 transition-all duration-150"
                        asChild
                      >
                        <Link href={ROUTES.examAnswers(set.id)}>
                          <BookOpen className="size-3.5 mr-1" />
                          উত্তর দেখুন
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimateIn>
          ))}

          {/* Motivational footer */}
          <AnimateIn
            variant="fade-up"
            delay={Math.min(sets.length * 60, 600)}
            duration={500}
          >
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground/70">
                🎯 নিয়মিত অনুশীলন করুন — সাফল্য আসবেই!
              </p>
            </div>
          </AnimateIn>
        </div>
      )}
    </div>
  );
}
