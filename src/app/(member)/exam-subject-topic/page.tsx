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
import {
  ContentSkeleton,
  ListSkeleton,
} from "@/components/ui/loading-skeleton";
import type { QuestionStats, ReviewQuestion } from "@/features/question-sets";
import { questionSetService } from "@/features/question-sets";
import {
  exams,
  getSubjectsByExamName,
  getTopicsBySubjectName,
} from "@/lib/data/exam-subject-topics";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Heart,
  Loader2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const OPTION_LABELS = ["ক", "খ", "গ", "ঘ"] as const;
const OPTION_KEYS = ["A", "B", "C", "D"] as const;
const PAGE_SIZE = 30;

// ── Step indicator ────────────────────────────────────────────────────────────
function Step({
  n,
  label,
  active,
  done,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
          done
            ? "bg-green-500 text-white"
            : active
              ? "bg-primary text-white"
              : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? "✓" : n}
      </span>
      <span
        className={`text-sm ${active ? "font-semibold" : "text-muted-foreground"}`}
      >
        {label}
      </span>
    </div>
  );
}

// ── Pill selector ─────────────────────────────────────────────────────────────
function PillGroup<T extends { name: string }>({
  items,
  selected,
  onSelect,
}: {
  items: T[];
  selected: string | null;
  onSelect: (name: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.name}
          onClick={() => onSelect(item.name)}
          className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            selected === item.name
              ? "border-primary bg-primary text-white"
              : "border-border bg-background hover:border-primary hover:bg-primary/5"
          }`}
        >
          {item.name}
          {selected === item.name && <ChevronRight className="size-3.5" />}
        </button>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ExamSubjectTopicPage() {
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [globalShowAnswers, setGlobalShowAnswers] = useState(true);
  const [hiddenAnswers, setHiddenAnswers] = useState<Set<string>>(new Set());
  const [activeExplanation, setActiveExplanation] = useState<string | null>(
    null,
  );
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<QuestionStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const subjects = useMemo(
    () => (selectedExam ? getSubjectsByExamName(selectedExam) : []),
    [selectedExam],
  );
  const topics = useMemo(
    () => (selectedSubject ? getTopicsBySubjectName(selectedSubject) : []),
    [selectedSubject],
  );

  // ── Load questions when topic is chosen ─────────────────────────────────────
  const loadQuestions = useCallback(
    async (subject: string, topic: string, cursor?: string) => {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setQuestions([]);
        setNextCursor(null);
        setIsEmpty(false);
      }
      try {
        const result = await questionSetService.getQuestionsByTopic({
          subject,
          topic,
          cursor,
          limit: PAGE_SIZE,
        });
        const newItems = result.data;
        setQuestions((prev) => (cursor ? [...prev, ...newItems] : newItems));
        setNextCursor(result.nextCursor);
        if (!cursor && newItems.length === 0) setIsEmpty(true);
        setFavorites((prev) => {
          const next = new Set(prev);
          newItems.filter((q) => q.isFavorite).forEach((q) => next.add(q.id));
          return next;
        });
      } catch {
        // silently fail
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (selectedSubject && selectedTopic) {
      loadQuestions(selectedSubject, selectedTopic);
    }
  }, [selectedSubject, selectedTopic, loadQuestions]);

  // ── Infinite scroll sentinel ─────────────────────────────────────────────────
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry?.isIntersecting &&
          nextCursor &&
          !loadingMore &&
          selectedSubject &&
          selectedTopic
        ) {
          loadQuestions(selectedSubject, selectedTopic, nextCursor);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [nextCursor, loadingMore, selectedSubject, selectedTopic, loadQuestions]);

  // ── Selection handlers ───────────────────────────────────────────────────────
  const handleSelectExam = (name: string) => {
    setSelectedExam(name);
    setSelectedSubject(null);
    setSelectedTopic(null);
    setQuestions([]);
  };
  const handleSelectSubject = (name: string) => {
    setSelectedSubject(name);
    setSelectedTopic(null);
    setQuestions([]);
  };
  const handleSelectTopic = (name: string) => {
    setSelectedTopic(name);
  };

  // ── Answer visibility ────────────────────────────────────────────────────────
  const handleGlobalToggle = useCallback(() => {
    setGlobalShowAnswers((prev) => !prev);
    setHiddenAnswers(new Set());
  }, []);

  const handleToggleIndividual = useCallback((questionId: string) => {
    setHiddenAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  }, []);

  const isAnswerVisible = useCallback(
    (questionId: string) => {
      const toggled = hiddenAnswers.has(questionId);
      return globalShowAnswers ? !toggled : toggled;
    },
    [globalShowAnswers, hiddenAnswers],
  );

  // ── Favorite toggle ──────────────────────────────────────────────────────────
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

  // ── Stats ────────────────────────────────────────────────────────────────────
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

  const step = !selectedExam
    ? 1
    : !selectedSubject
      ? 2
      : !selectedTopic
        ? 3
        : 4;

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page title */}
        <h1 className="text-xl font-semibold tracking-tight mb-5">
          বিষয়ভিত্তিক প্র্যাক্টিস
        </h1>

        {/* Step indicator */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Step n={1} label="পরীক্ষা" active={step === 1} done={step > 1} />
          <ChevronRight className="size-4 text-muted-foreground" />
          <Step n={2} label="বিষয়" active={step === 2} done={step > 2} />
          <ChevronRight className="size-4 text-muted-foreground" />
          <Step n={3} label="টপিক" active={step === 3} done={step > 3} />
          <ChevronRight className="size-4 text-muted-foreground" />
          <Step n={4} label="প্রশ্ন" active={step === 4} done={false} />
        </div>

        {/* Step 1 — Exam */}
        <section className="mb-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            পরীক্ষা বেছে নিন
          </p>
          <PillGroup
            items={exams}
            selected={selectedExam}
            onSelect={handleSelectExam}
          />
        </section>

        {/* Step 2 — Subject */}
        {selectedExam && (
          <section className="mb-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              বিষয় বেছে নিন
            </p>
            <PillGroup
              items={subjects}
              selected={selectedSubject}
              onSelect={handleSelectSubject}
            />
          </section>
        )}

        {/* Step 3 — Topic */}
        {selectedSubject && topics.length > 0 && (
          <section className="mb-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              টপিক বেছে নিন
            </p>
            <PillGroup
              items={topics}
              selected={selectedTopic}
              onSelect={handleSelectTopic}
            />
          </section>
        )}

        {/* Global show/hide answers — only when questions loaded */}
        {questions.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {questions.length}টি প্রশ্ন
            </p>
            <Button
              size="sm"
              variant={globalShowAnswers ? "outline" : "default"}
              onClick={handleGlobalToggle}
              className="gap-1.5"
            >
              {globalShowAnswers ? (
                <>
                  <EyeOff className="size-4" />
                  উত্তর লুকান
                </>
              ) : (
                <>
                  <Eye className="size-4" />
                  উত্তর দেখুন
                </>
              )}
            </Button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="mt-2">
            <ContentSkeleton />
          </div>
        )}

        {/* Empty state */}
        {!loading && isEmpty && (
          <p className="text-center text-muted-foreground py-12">
            এই টপিকে কোনো প্রশ্ন পাওয়া যায়নি
          </p>
        )}

        {/* Questions */}
        {!loading && questions.length > 0 && (
          <div className="space-y-6">
            {questions.map((question, idx) => (
              <div key={question.id}>
                {/* Question card */}
                <Card>
                  <CardContent className="py-5">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                        {idx + 1}
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
                  {isAnswerVisible(question.id)
                    ? OPTION_KEYS.map((key, i) => {
                        const optionText = question[
                          `option${key}` as keyof ReviewQuestion
                        ] as string;
                        const isCorrect = question.correctAnswer === key;
                        return (
                          <div
                            key={key}
                            className={`flex w-full items-center gap-3 rounded-lg border-2 p-3.5 ${
                              isCorrect
                                ? "border-green-400 bg-green-50"
                                : "border-gray-200"
                            }`}
                          >
                            <span
                              className={`flex size-9 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                                isCorrect
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {OPTION_LABELS[i]}
                            </span>
                            <span className="text-base flex-1">
                              {optionText}
                            </span>
                            {isCorrect && (
                              <CheckCircle2 className="size-5 text-green-500" />
                            )}
                          </div>
                        );
                      })
                    : OPTION_KEYS.map((key, i) => {
                        const optionText = question[
                          `option${key}` as keyof ReviewQuestion
                        ] as string;
                        return (
                          <div
                            key={key}
                            className="flex w-full items-center gap-3 rounded-lg border-2 border-gray-200 p-3.5"
                          >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full text-lg font-bold bg-gray-100 text-gray-600">
                              {OPTION_LABELS[i]}
                            </span>
                            <span className="text-base flex-1">
                              {optionText}
                            </span>
                          </div>
                        );
                      })}
                </div>

                {/* Action buttons */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={
                      isAnswerVisible(question.id) ? "outline" : "default"
                    }
                    onClick={() => handleToggleIndividual(question.id)}
                    className="gap-1.5"
                  >
                    {isAnswerVisible(question.id) ? (
                      <>
                        <EyeOff className="size-4" />
                        উত্তর লুকান
                      </>
                    ) : (
                      <>
                        <Eye className="size-4" />
                        উত্তর দেখুন
                      </>
                    )}
                  </Button>
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
                      onClick={() =>
                        setActiveExplanation(question.explanation!)
                      }
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
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="py-2" />

        {/* Load-more spinner */}
        {loadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Explanation dialog */}
      <Dialog
        open={activeExplanation !== null}
        onOpenChange={(open) => {
          if (!open) setActiveExplanation(null);
        }}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto w-full sm:max-w-lg p-4 sm:p-6">
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

      {/* Stats dialog */}
      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="size-5" />
              প্রশ্ন বিশ্লেষণ
            </DialogTitle>
          </DialogHeader>
          {statsLoading ? (
            <ListSkeleton count={4} />
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
