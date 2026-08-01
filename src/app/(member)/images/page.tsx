"use client";

import { AnimateIn } from "@/components/ui/animate-in";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { ContentSkeleton } from "@/components/ui/loading-skeleton";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/config/routes";
import { examCategoryService, type ExamCategory } from "@/features/exam-categories";
import {
  DEFAULT_STYLE_CONFIG,
  slideService,
  type JobStatusResult,
  type QuestionSetSlidesResult,
} from "@/features/slides";
import {
  subExamCategoryService,
  type SubExamCategory,
} from "@/features/sub-exam-categories";
import {
  questionSetService,
  type QuestionSet,
} from "@/features/question-sets";
import { AlertTriangle, CheckCircle2, ImageIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 120; // 3 minutes

function formatQuestionSetLabel(set: QuestionSet): string {
  const date = new Date(set.date).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return `${set.title} — ${date}`;
}

export default function ImagesPage() {
  const router = useRouter();

  const [examCategories, setExamCategories] = useState<ExamCategory[]>([]);
  const [subExamCategories, setSubExamCategories] = useState<SubExamCategory[]>([]);
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);

  const [examSlug, setExamSlug] = useState<string | null>(null);
  const [subExamSlug, setSubExamSlug] = useState<string | null>(null);
  const [questionSetId, setQuestionSetId] = useState<string | null>(null);

  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingSubExams, setLoadingSubExams] = useState(false);
  const [loadingQuestionSets, setLoadingQuestionSets] = useState(false);
  const [checkingCache, setCheckingCache] = useState(false);

  const [cached, setCached] = useState<QuestionSetSlidesResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [job, setJob] = useState<JobStatusResult | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 1: load exam categories once
  useEffect(() => {
    examCategoryService
      .getAll()
      .then(setExamCategories)
      .catch(() => setExamCategories([]))
      .finally(() => setLoadingExams(false));
  }, []);

  // Step 2: load sub-exam categories when an exam is chosen (selection reset + loading flag
  // are set by the combobox's onChange, not here — a synchronous setState at the top of an
  // effect body causes cascading renders)
  useEffect(() => {
    if (!examSlug) return;

    subExamCategoryService
      .getByCategorySlug(examSlug)
      .then(setSubExamCategories)
      .catch(() => setSubExamCategories([]))
      .finally(() => setLoadingSubExams(false));
  }, [examSlug]);

  // Step 3: load question sets when a sub-exam is chosen. `getAllBySubCategorySlug` is
  // admin-only — members can only see the live set + the archive, so combine those two.
  useEffect(() => {
    if (!subExamSlug) return;

    Promise.all([
      questionSetService.getLiveBySubCategorySlug(subExamSlug),
      questionSetService.getArchiveBySubCategorySlug(subExamSlug),
    ])
      .then(([live, archive]) => {
        setQuestionSets(live ? [live, ...archive] : archive);
      })
      .catch(() => setQuestionSets([]))
      .finally(() => setLoadingQuestionSets(false));
  }, [subExamSlug]);

  // On question-set select: immediately check cache
  useEffect(() => {
    if (!questionSetId) return;

    slideService
      .getByQuestionSetId(questionSetId)
      .then(setCached)
      .catch(() => setCached(null))
      .finally(() => setCheckingCache(false));
  }, [questionSetId]);

  // Clean up any in-flight poll timer on unmount
  useEffect(() => {
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, []);

  function pollJob(jobId: string, attempt: number) {
    if (attempt > MAX_POLL_ATTEMPTS) {
      setGenerating(false);
      setGenerateError("স্লাইড তৈরি হতে অনেক সময় লাগছে। পরে আবার চেষ্টা করুন।");
      return;
    }

    slideService
      .getJobStatus(jobId)
      .then((status) => {
        setJob(status);
        if (status.status === "DONE") {
          setGenerating(false);
          router.push(ROUTES.imagesPreview(questionSetId!));
        } else if (status.status === "FAILED") {
          setGenerating(false);
          setGenerateError(status.errorMessage || "স্লাইড তৈরি ব্যর্থ হয়েছে।");
        } else {
          pollTimer.current = setTimeout(() => pollJob(jobId, attempt + 1), POLL_INTERVAL_MS);
        }
      })
      .catch(() => {
        setGenerating(false);
        setGenerateError("স্লাইডের অবস্থা জানা যায়নি। আবার চেষ্টা করুন।");
      });
  }

  async function handleGenerate() {
    if (!questionSetId) return;
    setGenerating(true);
    setGenerateError(null);

    try {
      const result = await slideService.generate(questionSetId, DEFAULT_STYLE_CONFIG);
      if (result.cached) {
        setGenerating(false);
        router.push(ROUTES.imagesPreview(questionSetId));
        return;
      }
      if (result.jobId) {
        pollJob(result.jobId, 0);
      } else {
        setGenerating(false);
        setGenerateError("অপ্রত্যাশিত সাড়া পাওয়া গেছে। আবার চেষ্টা করুন।");
      }
    } catch {
      setGenerating(false);
      setGenerateError("স্লাইড তৈরি শুরু করা যায়নি। আবার চেষ্টা করুন।");
    }
  }

  const examOptions: ComboboxOption[] = examCategories.map((c) => ({
    value: c.slug,
    label: `${c.icon ?? "📝"} ${c.name}`,
  }));
  const subExamOptions: ComboboxOption[] = subExamCategories.map((c) => ({
    value: c.slug,
    label: c.name,
  }));
  const questionSetOptions: ComboboxOption[] = questionSets.map((s) => ({
    value: s.id,
    label: formatQuestionSetLabel(s),
  }));

  if (loadingExams) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <ContentSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8 page-enter">
      <AnimateIn variant="fade-up" duration={400}>
        <div className="mb-6 flex items-center gap-3">
          <ImageIcon className="size-7 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">ছবি স্লাইড তৈরি করুন</h1>
            <p className="text-sm text-muted-foreground">
              প্রশ্নসেট নির্বাচন করে ফেসবুক/ইনস্টাগ্রামের জন্য স্লাইড তৈরি করুন
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">১. পরীক্ষার ক্যাটাগরি</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Combobox
              options={examOptions}
              value={examSlug}
              onChange={(value) => {
                setExamSlug(value);
                setSubExamSlug(null);
                setSubExamCategories([]);
                setQuestionSetId(null);
                setQuestionSets([]);
                setLoadingSubExams(true);
              }}
              placeholder="পরীক্ষার ক্যাটাগরি নির্বাচন করুন"
              searchPlaceholder="ক্যাটাগরি খুঁজুন..."
            />

            {examSlug && (
              <div className="space-y-2">
                <label className="text-sm font-medium">২. সাব-ক্যাটাগরি</label>
                <Combobox
                  options={subExamOptions}
                  value={subExamSlug}
                  onChange={(value) => {
                    setSubExamSlug(value);
                    setQuestionSetId(null);
                    setQuestionSets([]);
                    setLoadingQuestionSets(true);
                  }}
                  placeholder={
                    loadingSubExams ? "লোড হচ্ছে..." : "সাব-ক্যাটাগরি নির্বাচন করুন"
                  }
                  disabled={loadingSubExams || subExamOptions.length === 0}
                />
              </div>
            )}

            {subExamSlug && (
              <div className="space-y-2">
                <label className="text-sm font-medium">৩. প্রশ্নসেট</label>
                <Combobox
                  options={questionSetOptions}
                  value={questionSetId}
                  onChange={(value) => {
                    setQuestionSetId(value);
                    setCached(null);
                    setJob(null);
                    setGenerateError(null);
                    setCheckingCache(true);
                  }}
                  placeholder={
                    loadingQuestionSets ? "লোড হচ্ছে..." : "প্রশ্নসেট নির্বাচন করুন"
                  }
                  disabled={loadingQuestionSets || questionSetOptions.length === 0}
                />
                {!loadingQuestionSets && questionSetOptions.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    এই সাব-ক্যাটাগরিতে কোনো প্রশ্নসেট পাওয়া যায়নি
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {questionSetId && checkingCache && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            সংরক্ষিত স্লাইড খোঁজা হচ্ছে...
          </div>
        )}

        {questionSetId && !checkingCache && cached && cached.slides.length > 0 && (
          <Alert className="mt-6">
            <CheckCircle2 className="size-4" />
            <AlertTitle>আগেই তৈরি হয়েছে</AlertTitle>
            <AlertDescription className="flex flex-col gap-3">
              <span>সংরক্ষিত স্লাইড দেখানো হচ্ছে। আপনি চাইলে এখনো এডিট করতে পারবেন।</span>
              <Button
                onClick={() => router.push(ROUTES.imagesPreview(questionSetId))}
                className="w-fit"
              >
                স্লাইড দেখুন
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {questionSetId && !checkingCache && (!cached || cached.slides.length === 0) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">৪. স্টাইল ও তৈরি করুন</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                ডিফল্ট স্টাইল (সাদা ব্যাকগ্রাউন্ড, প্রতি স্লাইডে ৫টি প্রশ্ন, অপশন ও ব্যাখ্যাসহ)
                ব্যবহার হবে। স্টাইল কাস্টমাইজেশন শীঘ্রই যুক্ত হবে।
              </p>

              {generateError && (
                <Alert variant="destructive">
                  <AlertTriangle className="size-4" />
                  <AlertTitle>সমস্যা হয়েছে</AlertTitle>
                  <AlertDescription>{generateError}</AlertDescription>
                </Alert>
              )}

              {generating ? (
                <div className="space-y-2">
                  <Progress value={job?.progress ?? 0} />
                  <p className="text-center text-sm text-muted-foreground">
                    {job?.progress
                      ? `স্লাইড তৈরি হচ্ছে... ${job.progress}%`
                      : "শুরু হচ্ছে..."}
                  </p>
                </div>
              ) : (
                <Button onClick={handleGenerate} className="w-full">
                  স্লাইড তৈরি করুন
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </AnimateIn>
    </div>
  );
}
