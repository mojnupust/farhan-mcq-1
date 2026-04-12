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
  ChevronLeft,
  ChevronRight,
  Heart,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useState } from "react";

const OPTION_LABELS = ["ক", "খ", "গ", "ঘ"] as const;
const OPTION_KEYS = ["A", "B", "C", "D"] as const;

type FilterType = "all" | "correct" | "wrong" | "unanswered";

export default function ExamReviewPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = use(params);
  const router = useRouter();

  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<QuestionStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const data = await questionSetService.getReviewQuestions(attemptId);
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
  }, [attemptId]);

  const filteredQuestions = useMemo(() => {
    switch (filter) {
      case "correct":
        return questions.filter((q) => q.isCorrect);
      case "wrong":
        return questions.filter((q) => q.userAnswer !== null && !q.isCorrect);
      case "unanswered":
        return questions.filter((q) => q.userAnswer === null);
      default:
        return questions;
    }
  }, [questions, filter]);

  const currentQuestion = filteredQuestions[currentIndex];

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

  const correctCount = questions.filter((q) => q.isCorrect).length;
  const wrongCount = questions.filter(
    (q) => q.userAnswer !== null && !q.isCorrect,
  ).length;
  const unansweredCount = questions.filter((q) => q.userAnswer === null).length;

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-center text-muted-foreground py-12">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!currentQuestion) {
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
          <h1 className="text-xl font-semibold tracking-tight">
            প্রশ্ন পর্যালোচনা
          </h1>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => {
              setFilter("all");
              setCurrentIndex(0);
            }}
          >
            সকল ({questions.length})
          </Button>
          <Button
            size="sm"
            variant={filter === "correct" ? "default" : "outline"}
            className={
              filter === "correct"
                ? ""
                : "text-green-600 border-green-200 hover:bg-green-50"
            }
            onClick={() => {
              setFilter("correct");
              setCurrentIndex(0);
            }}
          >
            <CheckCircle2 className="size-3.5 mr-1" />
            সঠিক ({correctCount})
          </Button>
          <Button
            size="sm"
            variant={filter === "wrong" ? "default" : "outline"}
            className={
              filter === "wrong"
                ? ""
                : "text-red-600 border-red-200 hover:bg-red-50"
            }
            onClick={() => {
              setFilter("wrong");
              setCurrentIndex(0);
            }}
          >
            <XCircle className="size-3.5 mr-1" />
            ভুল ({wrongCount})
          </Button>
          <Button
            size="sm"
            variant={filter === "unanswered" ? "default" : "outline"}
            className={
              filter === "unanswered"
                ? ""
                : "text-gray-500 border-gray-200 hover:bg-gray-50"
            }
            onClick={() => {
              setFilter("unanswered");
              setCurrentIndex(0);
            }}
          >
            বাদ ({unansweredCount})
          </Button>
        </div>

        {/* Question Card */}
        <Card>
          <CardContent className="py-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {currentQuestion.sortOrder}
              </span>
              {currentQuestion.subject && (
                <Badge variant="secondary" className="text-xs">
                  {currentQuestion.subject}
                </Badge>
              )}
              {currentQuestion.userAnswer === null ? (
                <Badge
                  variant="outline"
                  className="text-gray-500 border-gray-300"
                >
                  উত্তর দেওয়া হয়নি
                </Badge>
              ) : currentQuestion.isCorrect ? (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle2 className="size-3 mr-1" />
                  সঠিক
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700 border-red-200">
                  <XCircle className="size-3 mr-1" />
                  ভুল
                </Badge>
              )}
            </div>
            <p className="text-lg leading-relaxed whitespace-pre-wrap">
              {currentQuestion.questionText}
            </p>
          </CardContent>
        </Card>

        {/* Options */}
        <div className="mt-3 space-y-2">
          {OPTION_KEYS.map((key, i) => {
            const optionText = currentQuestion[
              `option${key}` as keyof ReviewQuestion
            ] as string;
            const isUserAnswer = currentQuestion.userAnswer === key;
            const isCorrectAnswer = currentQuestion.correctAnswer === key;
            const shouldHighlight = showAnswer || isUserAnswer;

            let borderClass = "border-gray-200";
            let bgClass = "";

            if (shouldHighlight) {
              if (isCorrectAnswer) {
                borderClass = "border-green-400";
                bgClass = "bg-green-50";
              } else if (isUserAnswer && !currentQuestion.isCorrect) {
                borderClass = "border-red-400";
                bgClass = "bg-red-50";
              }
            }

            return (
              <div
                key={key}
                className={`flex w-full items-center gap-3 rounded-lg border-2 p-3.5 ${borderClass} ${bgClass}`}
              >
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                    shouldHighlight && isCorrectAnswer
                      ? "bg-green-500 text-white"
                      : shouldHighlight && isUserAnswer
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {OPTION_LABELS[i]}
                </span>
                <span className="text-base flex-1">{optionText}</span>
                {shouldHighlight && isCorrectAnswer && (
                  <CheckCircle2 className="size-5 text-green-500" />
                )}
                {shouldHighlight &&
                  isUserAnswer &&
                  !currentQuestion.isCorrect && (
                    <XCircle className="size-5 text-red-500" />
                  )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={showAnswer ? "default" : "outline"}
            onClick={() => setShowAnswer(!showAnswer)}
          >
            {showAnswer ? "উত্তর লুকান" : "উত্তর দেখুন"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleShowStats(currentQuestion.id)}
          >
            <BarChart3 className="size-4 mr-1" />
            বিশ্লেষণ
          </Button>
          {currentQuestion.explanation && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowExplanation(true)}
            >
              <BookOpen className="size-4 mr-1" />
              ব্যাখ্যা
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggleFavorite(currentQuestion.id)}
            className={
              favorites.has(currentQuestion.id)
                ? "text-rose-500 border-rose-200 bg-rose-50"
                : ""
            }
          >
            <Heart
              className={`size-4 mr-1 ${
                favorites.has(currentQuestion.id) ? "fill-rose-500" : ""
              }`}
            />
            ফেভারিট
          </Button>
        </div>

        {/* Navigation */}
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={currentIndex === 0}
            onClick={() => {
              setCurrentIndex((p) => Math.max(0, p - 1));
              setShowAnswer(false);
            }}
          >
            <ChevronLeft className="size-4 mr-1" />
            আগের
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {filteredQuestions.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentIndex >= filteredQuestions.length - 1}
            onClick={() => {
              setCurrentIndex((p) =>
                Math.min(filteredQuestions.length - 1, p + 1),
              );
              setShowAnswer(false);
            }}
          >
            পরের
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>

        {/* Question Palette */}
        <Card className="mt-4">
          <CardContent className="py-4">
            <div className="grid grid-cols-10 gap-10">
              {filteredQuestions.map((q, i) => {
                const isCurrent = i === currentIndex;
                let colorClass = "bg-gray-100 text-gray-600";
                if (q.isCorrect) colorClass = "bg-green-500 text-white";
                else if (q.userAnswer !== null)
                  colorClass = "bg-red-500 text-white";

                return (
                  <button
                    type="button"
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(i);
                      setShowAnswer(false);
                    }}
                    className={`flex size-8 items-center justify-center rounded text-xs font-bold transition-all ${colorClass} ${
                      isCurrent ? "ring-2 ring-primary/50 ring-offset-1" : ""
                    }`}
                  >
                    {q.sortOrder}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Explanation Dialog */}
      <Dialog open={showExplanation} onOpenChange={setShowExplanation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="size-5" />
              ব্যাখ্যা
            </DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {currentQuestion.explanation}
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
