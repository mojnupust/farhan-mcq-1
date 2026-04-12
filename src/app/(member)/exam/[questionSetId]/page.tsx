"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/features/auth";
import type {
  ExamAttempt,
  ExamQuestion,
  QuestionSet,
} from "@/features/question-sets";
import { questionSetService } from "@/features/question-sets";
import { useSubscription } from "@/features/subscriptions";
import {
  AlertTriangle,
  AlertTriangleIcon,
  ArrowUp,
  Clock,
  PackageOpen,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";

const OPTION_LABELS = ["ক", "খ", "গ", "ঘ"] as const;
const OPTION_KEYS = ["A", "B", "C", "D"] as const;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function ExamPage({
  params,
}: {
  params: Promise<{ questionSetId: string }>;
}) {
  const { questionSetId } = use(params);
  const router = useRouter();
  const { user, isLoading, isAdmin } = useAuth();
  const { hasActiveSubscription, liveRemaining, archiveRemaining } =
    useSubscription();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Exam state
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerReady, setTimerReady] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initCalledRef = useRef(false);
  const questionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initialize exam - guarded against double-calls (React Strict Mode)
  useEffect(() => {
    if (initCalledRef.current) return;
    initCalledRef.current = true;

    const init = async () => {
      try {
        const [qs, existingAttempt] = await Promise.all([
          questionSetService.getById(questionSetId),
          questionSetService.getUserAttempt(questionSetId),
        ]);
        setQuestionSet(qs);

        if (existingAttempt?.isCompleted) {
          router.replace(ROUTES.marksheet(existingAttempt.id));
          return;
        }

        // Start or resume attempt
        const att = existingAttempt
          ? await questionSetService.startExam(questionSetId).catch(() => ({
              id: existingAttempt.id,
              userId: "",
              questionSetId,
              startedAt: new Date().toISOString(),
              submittedAt: null,
              totalCorrect: 0,
              totalWrong: 0,
              totalUnanswered: 0,
              totalMarks: 0,
              obtainedMarks: 0,
              isCompleted: false,
            }))
          : await questionSetService.startExam(questionSetId);

        const examQuestions =
          await questionSetService.getExamQuestions(questionSetId);
        setQuestions(examQuestions);

        // Set timeLeft BEFORE attempt so timer effect doesn't bail
        setTimeLeft(qs.duration * 60);
        setAttempt(att);
        setTimerReady(true);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "পরীক্ষা শুরু করতে সমস্যা হয়েছে",
        );
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [questionSetId, router]);

  // Countdown timer - starts only when timerReady is true
  useEffect(() => {
    if (!timerReady || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerReady]);

  // Get unique subjects
  const subjects = useMemo(() => {
    const subjectSet = new Set(
      questions.map((q) => q.subject).filter(Boolean) as string[],
    );
    return Array.from(subjectSet);
  }, [questions]);

  // Filter questions by subject
  const filteredQuestions = useMemo(() => {
    if (!subjectFilter) return questions;
    return questions.filter((q) => q.subject === subjectFilter);
  }, [questions, subjectFilter]);

  // Track scroll position for scroll-to-top button & active question
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      // Find which question is most visible
      const entries = Array.from(questionRefs.current.entries());
      for (let idx = entries.length - 1; idx >= 0; idx--) {
        const el = entries[idx]![1];
        const rect = el.getBoundingClientRect();
        if (rect.top <= 150) {
          // Find filtered index
          const filteredIdx = filteredQuestions.findIndex(
            (q) => q.id === entries[idx]![0],
          );
          if (filteredIdx !== -1) {
            setActiveQuestionIndex(filteredIdx);
          }
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredQuestions]);

  // Answer a question
  const handleAnswer = useCallback(
    async (questionId: string, optionKey: string) => {
      if (!attempt) return;

      // Already answered - locked
      if (answers[questionId]) return;

      setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));

      try {
        await questionSetService.answerQuestion(attempt.id, {
          questionId,
          selectedAnswer: optionKey,
        });
      } catch {
        // Silently fail - answer is stored locally
      }
    },
    [attempt, answers],
  );

  // Submit exam
  const handleSubmitExam = useCallback(async () => {
    if (!attempt) return;
    setSubmitting(true);
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      const result = await questionSetService.submitExam(attempt.id);
      router.push(ROUTES.marksheet(result.id));
    } catch {
      setSubmitting(false);
      setShowSubmitDialog(false);
    }
  }, [attempt, router]);

  // Scroll to question
  const scrollToQuestion = useCallback((questionId: string) => {
    const el = questionRefs.current.get(questionId);
    if (el) {
      const topBarHeight = 110;
      const y = el.getBoundingClientRect().top + window.scrollY - topBarHeight;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, []);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Stats
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-3 text-muted-foreground">পরীক্ষা লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="mx-4 max-w-md">
          <CardContent className="py-8 text-center">
            <AlertTriangle className="mx-auto size-12 text-red-500 mb-3" />
            <p className="text-lg font-semibold text-red-600">{error}</p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => router.back()}
            >
              ফিরে যান
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!questionSet || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="mx-4 max-w-md">
          <CardContent className="py-2 text-center">
            <AlertTriangleIcon className="mx-auto size-12 text-red-500 mb-3" />
            <p className="text-lg font-semibold text-red-600">
              প্রশ্ন সেট পাওয়া যায়নি
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => router.back()}
            >
              ফিরে যান
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Subscription gate: skip for free exams and admins
  if (!questionSet.isFree && !isAdmin) {
    const quotaExhausted = questionSet.isLive
      ? liveRemaining !== null && liveRemaining <= 0
      : archiveRemaining !== null && archiveRemaining <= 0;

    if (!hasActiveSubscription || quotaExhausted) {
      const message = !hasActiveSubscription
        ? "পরীক্ষায় অংশগ্রহণ করতে একটি সক্রিয় প্যাকেজ প্রয়োজন।"
        : questionSet.isLive
          ? "আপনার লাইভ পরীক্ষার কোটা শেষ হয়ে গেছে।"
          : "আপনার আর্কাইভ পরীক্ষার কোটা শেষ হয়ে গেছে।";

      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <Card className="mx-4 max-w-md">
            <CardContent className="py-8 text-center">
              <PackageOpen className="mx-auto size-12 text-amber-500 mb-3" />
              <p className="text-lg font-semibold">{message}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                সাবস্ক্রিপশন পাতা থেকে প্যাকেজ কিনুন।
              </p>
              <Button className="mt-5" asChild>
                <Link href={ROUTES.subscriptions}>প্যাকেজ কিনুন</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" ref={scrollContainerRef}>
      {/* Top Bar: Timer + Subject Filter + Submit */}
      <div className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-2">
          {/* Timer */}
          <div
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-lg font-bold ${
              timeLeft < 60
                ? "bg-red-100 text-red-600 animate-pulse"
                : timeLeft < 300
                  ? "bg-amber-100 text-amber-600"
                  : "bg-green-100 text-green-700"
            }`}
          >
            <Clock className="size-4" />
            {formatTime(timeLeft)}
          </div>

          {/* Title */}
          <h1 className="hidden text-sm font-semibold sm:block truncate max-w-50">
            {questionSet.title}
          </h1>

          {/* Submit */}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setShowSubmitDialog(true)}
            disabled={submitting}
          >
            <Send className="size-4 mr-1.5" />
            জমা দিন
          </Button>
        </div>

        {/* Subject Filter */}
        {subjects.length > 1 && (
          <div className="border-t bg-gray-50">
            <div className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-4 py-1.5">
              <Button
                size="sm"
                variant={subjectFilter === null ? "default" : "ghost"}
                className="h-7 text-xs shrink-0"
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
                    variant={subjectFilter === s ? "default" : "ghost"}
                    className="h-7 text-xs shrink-0"
                    onClick={() => setSubjectFilter(s)}
                  >
                    {s} ({count})
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          {/* All Questions - Scrollable */}
          <div className="space-y-4">
            {filteredQuestions.map((question) => {
              const optionAnswer = answers[question.id];
              return (
                <div
                  key={question.id}
                  ref={(el) => {
                    if (el) questionRefs.current.set(question.id, el);
                  }}
                  data-question-id={question.id}
                >
                  <Card>
                    <CardContent className="py-5">
                      {/* Question Number + Subject */}
                      <div className="mb-3 flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                          {question.sortOrder}
                        </span>
                        {question.subject && (
                          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                            {question.subject}
                          </span>
                        )}
                        {optionAnswer && (
                          <span className="ml-auto rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                            উত্তর দেওয়া হয়েছে
                          </span>
                        )}
                      </div>

                      {/* Question Text */}
                      <p className="text-lg leading-relaxed whitespace-pre-wrap">
                        {question.questionText}
                      </p>

                      {/* Options */}
                      <div className="mt-4 space-y-2">
                        {OPTION_KEYS.map((key, i) => {
                          const optionText = question[
                            `option${key}` as keyof ExamQuestion
                          ] as string;
                          const isSelected = optionAnswer === key;
                          const isLocked =
                            optionAnswer !== undefined && !isSelected;

                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => handleAnswer(question.id, key)}
                              disabled={isLocked}
                              className={`flex w-full items-center gap-3 rounded-lg border-2 p-3.5 text-left transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                  : isLocked
                                    ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                                    : "border-gray-200 hover:border-primary/50 hover:bg-gray-50 cursor-pointer"
                              }`}
                            >
                              <span
                                className={`flex size-9 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                                  isSelected
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {OPTION_LABELS[i]}
                              </span>
                              <span className="text-base">{optionText}</span>
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}

            {/* Bottom spacer */}
            <div className="h-20" />
          </div>

          {/* Question Palette (Sidebar) */}
          <div className="lg:sticky lg:top-30 lg:self-start">
            <Card>
              <CardContent className="py-4">
                <h3 className="mb-3 text-sm font-semibold text-center">
                  প্রশ্ন নম্বর
                </h3>
                <div className="grid grid-cols-5 gap-x-3 gap-y-2">
                  {filteredQuestions.map((q, i) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isCurrent = i === activeQuestionIndex;
                    return (
                      <button
                        type="button"
                        key={q.id}
                        onClick={() => scrollToQuestion(q.id)}
                        className={`flex size-9 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                          isCurrent
                            ? "bg-primary text-white ring-2 ring-primary/30"
                            : isAnswered
                              ? "bg-green-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {q.sortOrder}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded bg-green-500" />
                    উত্তর দেওয়া ({answeredCount})
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded bg-gray-100 border" />
                    উত্তর দেওয়া হয়নি ({unansweredCount})
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 flex size-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:bg-primary/90 active:scale-95"
          title="উপরে যান"
        >
          <ArrowUp className="size-5" />
        </button>
      )}

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              পরীক্ষা জমা দিতে চান?
            </DialogTitle>
            <DialogDescription>
              একবার জমা দিলে আর পরিবর্তন করা যাবে না।
            </DialogDescription>
          </DialogHeader>

          <div className="my-2 rounded-lg bg-gray-50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>মোট প্রশ্ন:</span>
              <span className="font-bold">{questions.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600">উত্তর দেওয়া:</span>
              <span className="font-bold text-green-600">{answeredCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-red-600">উত্তর দেওয়া হয়নি:</span>
              <span className="font-bold text-red-600">{unansweredCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>অবশিষ্ট সময়:</span>
              <span className="font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowSubmitDialog(false)}
            >
              বাতিল
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmitExam}
              disabled={submitting}
            >
              {submitting ? "জমা হচ্ছে..." : "হ্যাঁ, জমা দিন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
