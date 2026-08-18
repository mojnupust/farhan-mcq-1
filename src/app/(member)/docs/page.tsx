"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AnimateIn } from "@/components/ui/animate-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { ContentSkeleton } from "@/components/ui/loading-skeleton";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/config/routes";
import {
  examCategoryService,
  type ExamCategory,
} from "@/features/exam-categories";
import {
  buildDefaultDocxStyleConfig,
  docxService,
  type DocxJobStatusResult,
  type DocxStyleConfigInput,
} from "@/features/docs";
import { DocxStylePanel } from "@/features/docs/components/docx-style-panel";
import { questionSetService, type QuestionSet } from "@/features/question-sets";
import {
  subExamCategoryService,
  type SubExamCategory,
} from "@/features/sub-exam-categories";
import { AlertTriangle, FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 90;
const STUCK_QUEUED_MS = 45_000;

function formatQuestionSetLabel(set: QuestionSet): string {
  const date = new Date(set.date).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return `${set.title} — ${date}`;
}

export default function DocsPage() {
  const router = useRouter();

  const [examCategories, setExamCategories] = useState<ExamCategory[]>([]);
  const [subExamCategories, setSubExamCategories] = useState<SubExamCategory[]>(
    [],
  );
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);

  const [examSlug, setExamSlug] = useState<string | null>(null);
  const [subExamSlug, setSubExamSlug] = useState<string | null>(null);
  const [selectedSetIds, setSelectedSetIds] = useState<string[]>([]);

  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingSubExams, setLoadingSubExams] = useState(false);
  const [loadingQuestionSets, setLoadingQuestionSets] = useState(false);

  const [styleConfig, setStyleConfig] = useState<DocxStyleConfigInput>(
    buildDefaultDocxStyleConfig,
  );
  const [generating, setGenerating] = useState(false);
  const [job, setJob] = useState<DocxJobStatusResult | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollStartedAt = useRef<number | null>(null);

  useEffect(() => {
    examCategoryService
      .getAll()
      .then(setExamCategories)
      .catch(() => setExamCategories([]))
      .finally(() => setLoadingExams(false));
  }, []);

  useEffect(() => {
    if (!examSlug) return;
    subExamCategoryService
      .getByCategorySlug(examSlug)
      .then(setSubExamCategories)
      .catch(() => setSubExamCategories([]))
      .finally(() => setLoadingSubExams(false));
  }, [examSlug]);

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

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, []);

  function toggleQuestionSet(id: string) {
    setSelectedSetIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function pollJob(jobId: string, attempt: number) {
    if (attempt > MAX_POLL_ATTEMPTS) {
      setGenerating(false);
      setGenerateError(
        "Docx তৈরি হতে অনেক সময় লাগছে। Redis ও MinIO চালু আছে কিনা দেখুন, তারপর আবার চেষ্টা করুন।",
      );
      return;
    }

    docxService
      .getJobStatus(jobId)
      .then((status) => {
        setJob(status);

        const queuedTooLong =
          pollStartedAt.current !== null &&
          Date.now() - pollStartedAt.current > STUCK_QUEUED_MS &&
          status.status === "QUEUED" &&
          status.progress === 0;

        if (queuedTooLong) {
          setGenerating(false);
          setGenerateError(
            "Docx ওয়ার্কার চালু নেই। backend-এ `npm run worker:dev` চালান অথবা API রিস্টার্ট করুন।",
          );
          return;
        }

        if (status.status === "DONE" && status.document) {
          setGenerating(false);
          router.push(ROUTES.docsPreview(status.document.id));
        } else if (status.status === "FAILED") {
          setGenerating(false);
          setGenerateError(status.errorMessage || "Docx তৈরি ব্যর্থ হয়েছে।");
        } else {
          pollTimer.current = setTimeout(
            () => pollJob(jobId, attempt + 1),
            POLL_INTERVAL_MS,
          );
        }
      })
      .catch(() => {
        setGenerating(false);
        setGenerateError("Docx-এর অবস্থা জানা যায়নি। আবার চেষ্টা করুন।");
      });
  }

  async function handleGenerate() {
    if (selectedSetIds.length === 0) return;
    setGenerating(true);
    setGenerateError(null);
    setJob(null);

    try {
      const result = await docxService.generate(selectedSetIds, styleConfig);
      if (result.cached && result.document) {
        setGenerating(false);
        router.push(ROUTES.docsPreview(result.document.id));
        return;
      }
      if (result.jobId) {
        pollStartedAt.current = Date.now();
        pollJob(result.jobId, 0);
      } else {
        setGenerating(false);
        setGenerateError("অপ্রত্যাশিত সাড়া পাওয়া গেছে। আবার চেষ্টা করুন।");
      }
    } catch {
      setGenerating(false);
      setGenerateError("Docx তৈরি শুরু করা যায়নি। আবার চেষ্টা করুন।");
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

  const progressLabel =
    job?.status === "PROCESSING" && job.progress > 0
      ? `Docx তৈরি হচ্ছে... ${job.progress}%`
      : job?.status === "QUEUED"
        ? "কিউতে আছে — ওয়ার্কার শুরু করছে..."
        : "শুরু হচ্ছে...";

  if (loadingExams) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <ContentSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-8 page-enter">
      <AnimateIn variant="fade-up" duration={400}>
        <div className="mb-6 flex items-center gap-3">
          <FileText className="size-7 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Docx তৈরি করুন
            </h1>
            <p className="text-sm text-muted-foreground">
              এক বা একাধিক প্রশ্নসেট নির্বাচন করে প্রিন্ট-রেডি Word ফাইল তৈরি
              করুন
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
                setSelectedSetIds([]);
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
                    setSelectedSetIds([]);
                    setQuestionSets([]);
                    setLoadingQuestionSets(true);
                  }}
                  placeholder={
                    loadingSubExams
                      ? "লোড হচ্ছে..."
                      : "সাব-ক্যাটাগরি নির্বাচন করুন"
                  }
                  disabled={loadingSubExams || subExamOptions.length === 0}
                />
              </div>
            )}

            {subExamSlug && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    ৩. প্রশ্নসেট (এক বা একাধিক)
                  </label>
                  {selectedSetIds.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {selectedSetIds.length}টি নির্বাচিত
                    </span>
                  )}
                </div>
                {loadingQuestionSets ? (
                  <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>
                ) : questionSets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    এই সাব-ক্যাটাগরিতে কোনো প্রশ্নসেট পাওয়া যায়নি
                  </p>
                ) : (
                  <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border p-3">
                    {questionSets.map((set) => {
                      const checked = selectedSetIds.includes(set.id);
                      return (
                        <label
                          key={set.id}
                          className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted/50"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleQuestionSet(set.id)}
                            className="mt-1 size-4 accent-primary"
                          />
                          <span className="text-sm leading-snug">
                            {formatQuestionSetLabel(set)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedSetIds.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">৪. লেআউট ও ডিজাইন</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DocxStylePanel value={styleConfig} onChange={setStyleConfig} />

              {generateError && (
                <Alert variant="destructive">
                  <AlertTriangle className="size-4" />
                  <AlertTitle>সমস্যা হয়েছে</AlertTitle>
                  <AlertDescription>{generateError}</AlertDescription>
                </Alert>
              )}

              {generating ? (
                <div className="space-y-3">
                  <Progress value={job?.progress ?? 0} />
                  <p className="text-center text-sm text-muted-foreground">
                    {progressLabel}
                  </p>
                </div>
              ) : (
                <Button
                  onClick={handleGenerate}
                  className="hidden w-full md:flex"
                >
                  Docx তৈরি করুন ({selectedSetIds.length} প্রশ্নসেট)
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </AnimateIn>

      {selectedSetIds.length > 0 && !generating && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur md:hidden">
          <Button onClick={handleGenerate} className="w-full">
            Docx তৈরি করুন ({selectedSetIds.length})
          </Button>
        </div>
      )}
      {generating && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur md:hidden">
          <Progress value={job?.progress ?? 0} className="mb-2" />
          <p className="text-center text-xs text-muted-foreground">
            {progressLabel}
          </p>
        </div>
      )}
    </div>
  );
}
