"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { QuestionStats, ReviewQuestion } from "@/features/question-sets";
import { questionSetService } from "@/features/question-sets";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Heart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import "./hide-scrollbar.css";

const OPTION_LABELS = ["ক", "খ", "গ", "ঘ"] as const;
const OPTION_KEYS = ["A", "B", "C", "D"] as const;

export default function AnswersPage({
  params,
}: {
  params: Promise<{ questionSetId: string }>;
}) {
  const { questionSetId } = use(params);
  const router = useRouter();

  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<QuestionStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeExplanation, setActiveExplanation] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const load = async () => {
      try {
        const data =
          await questionSetService.getQuestionsForReview(questionSetId);
        setQuestions(data);
        setFavorites(
          new Set(data.filter((q) => q.isFavorite).map((q) => q.id)),
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [questionSetId]);

  const subjects = useMemo(() => {
    const subjectSet = new Set(
      questions.map((q) => q.subject).filter(Boolean) as string[],
    );
    return Array.from(subjectSet);
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    if (!subjectFilter) return questions;
    return questions.filter((q) => q.subject === subjectFilter);
  }, [questions, subjectFilter]);

  const handleShowStats = useCallback(async (questionId: string) => {
    setShowStats(true);
    setStatsLoading(true);
    try {
      const data = await questionSetService.getQuestionStats(questionId);
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const handleToggleFavorite = useCallback(async (questionId: string) => {
    try {
      const isFav = await questionSetService.toggleFavorite(questionId);
      setFavorites((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(questionId);
        else next.delete(questionId);
        return next;
      });
    } catch {
      // ignore
    }
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-center text-muted-foreground py-12">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!filteredQuestions.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="size-4 mr-1" />
          ফিরে যান
        </Button>
        <p className="text-center text-muted-foreground py-12">
          কোনো প্রশ্ন পাওয়া যায়নি
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">উত্তরপত্র</h1>
        </div>

        {/* Subject Filter */}
        {subjects.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              size="sm"
              variant={subjectFilter === null ? "default" : "outline"}
              onClick={() => setSubjectFilter(null)}
            >
              সকল ({questions.length})
            </Button>
            {subjects.map((s) => {
              const count = questions.filter((q) => q.subject === s).length;
              return (
                <Button
                  key={s}
                  size="sm"
                  variant={subjectFilter === s ? "default" : "outline"}
                  onClick={() => setSubjectFilter(s)}
                >
                  {s} ({count})
                </Button>
              );
            })}
          </div>
        )}

        {/* Questions - Flat View */}
        <div className="space-y-6">
          {filteredQuestions.map((question) => (
            <div key={question.id}>
              {/* Question Card */}
              <Card>
                <CardContent className="py-5">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {question.sortOrder}
                    </span>
                    {question.subject && (
                      <Badge variant="secondary" className="text-xs">
                        {question.subject}
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">
                    {question.questionText}
                  </p>
                </CardContent>
              </Card>

              {/* Options */}
              <div className="mt-3 space-y-2">
                {OPTION_KEYS.map((key, i) => {
                  const optionText = question[
                    `option${key}` as keyof ReviewQuestion
                  ] as string;
                  const isCorrectAnswer = question.correctAnswer === key;

                  return (
                    <div
                      key={key}
                      className={`flex w-full items-center gap-3 rounded-lg border-2 p-3.5 ${
                        isCorrectAnswer
                          ? "border-green-400 bg-green-50"
                          : "border-gray-200"
                      }`}
                    >
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                          isCorrectAnswer
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {OPTION_LABELS[i]}
                      </span>
                      <span className="text-base flex-1">{optionText}</span>
                      {isCorrectAnswer && (
                        <CheckCircle2 className="size-5 text-green-500" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleShowStats(question.id)}
                >
                  <BarChart3 className="size-4 mr-1" />
                  বিশ্লেষণ
                </Button>
                {question.explanation && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveExplanation(question.explanation!)}
                  >
                    <BookOpen className="size-4 mr-1" />
                    ব্যাখ্যা
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleFavorite(question.id)}
                  className={
                    favorites.has(question.id)
                      ? "text-rose-500 border-rose-200 bg-rose-50"
                      : ""
                  }
                >
                  <Heart
                    className={`size-4 mr-1 ${
                      favorites.has(question.id) ? "fill-rose-500" : ""
                    }`}
                  />
                  ফেভারিট
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explanation Dialog */}
      <Dialog
        open={activeExplanation !== null}
        onOpenChange={(open) => {
          if (!open) setActiveExplanation(null);
        }}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto w-full sm:max-w-lg p-4 sm:p-6 hide-scrollbar">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="size-5" />
              ব্যাখ্যা
            </DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {activeExplanation}
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="size-5" />
              প্রশ্ন বিশ্লেষণ
            </DialogTitle>
          </DialogHeader>
          {statsLoading ? (
            <p className="text-center text-muted-foreground py-4">
              লোড হচ্ছে...
            </p>
          ) : stats ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                <span>মোট উত্তরদাতা</span>
                <span className="font-bold text-lg">{stats.totalAttempts}</span>
              </div>
              {stats.totalAttempts > 0 && (
                <>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-green-50">
                    <span className="text-green-700">সঠিক উত্তর</span>
                    <div className="text-right">
                      <span className="font-bold text-lg text-green-700">
                        {stats.correctCount}
                      </span>
                      <span className="text-sm text-green-600 ml-2">
                        (
                        {Math.round(
                          (stats.correctCount / stats.totalAttempts) * 100,
                        )}
                        %)
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-red-50">
                    <span className="text-red-700">ভুল উত্তর</span>
                    <div className="text-right">
                      <span className="font-bold text-lg text-red-700">
                        {stats.wrongCount}
                      </span>
                      <span className="text-sm text-red-600 ml-2">
                        (
                        {Math.round(
                          (stats.wrongCount / stats.totalAttempts) * 100,
                        )}
                        %)
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                    <span className="text-gray-600">উত্তর দেওয়া হয়নি</span>
                    <div className="text-right">
                      <span className="font-bold text-lg text-gray-600">
                        {stats.unansweredCount}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        (
                        {Math.round(
                          (stats.unansweredCount / stats.totalAttempts) * 100,
                        )}
                        %)
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              তথ্য পাওয়া যায়নি
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
