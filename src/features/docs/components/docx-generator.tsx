"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AnimateIn } from "@/components/ui/animate-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { ContentSkeleton } from "@/components/ui/loading-skeleton";
import { Progress } from "@/components/ui/progress";
import {
  buildDefaultDocxStyleConfig,
  docxService,
  type DocxJobStatusResult,
  type DocxStyleConfigInput,
} from "@/features/docs";
import {
  examCategoryService,
  type ExamCategory,
} from "@/features/exam-categories";
import { questionSetService, type QuestionSet } from "@/features/question-sets";
import {
  subExamCategoryService,
  type SubExamCategory,
} from "@/features/sub-exam-categories";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  FileText,
  FolderOpen,
  PenLine,
  Printer,
  ShoppingBag,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { DocxStylePanel } from "./docx-style-panel";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 90;
const STUCK_QUEUED_MS = 45_000;

const STEPS = [
  "পরীক্ষার ক্যাটাগরি",
  "সাব-ক্যাটাগরি",
  "প্রশ্নসেট",
  "ডিজাইন ও ডাউনলোড",
] as const;

function formatQuestionSetLabel(set: QuestionSet): string {
  const date = new Date(set.date).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return `${set.title} — ${date}`;
}

interface DocxGeneratorProps {
  /** Base path the preview page lives under (admin vs public), e.g. "/docs/preview". */
  previewBasePath: string;
  /** Shows the free-feature + donation message for public/anonymous users. */
  showDonationBanner?: boolean;
  /** Content wrapper max-width, e.g. "max-w-5xl" on the public site to match the header. */
  maxWidthClassName?: string;
}

export function DocxGenerator({
  previewBasePath,
  showDonationBanner = false,
  maxWidthClassName = "max-w-2xl",
}: DocxGeneratorProps) {
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

  function selectAllQuestionSets() {
    setSelectedSetIds(
      selectedSetIds.length === questionSets.length
        ? []
        : questionSets.map((s) => s.id),
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
          router.push(`${previewBasePath}/${status.document.id}`);
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
        router.push(`${previewBasePath}/${result.document.id}`);
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

  const currentStep = !examSlug
    ? 0
    : !subExamSlug
      ? 1
      : selectedSetIds.length === 0
        ? 2
        : 3;

  if (loadingExams) {
    return (
      <div className={`mx-auto px-4 py-6 sm:px-6 lg:px-8 ${maxWidthClassName}`}>
        <ContentSkeleton />
      </div>
    );
  }

  return (
    <div
      className={`mx-auto px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:pb-8 page-enter ${maxWidthClassName}`}
    >
      <AnimateIn variant="fade-up" duration={400}>
        <div className="mb-5 flex items-center gap-3">
          <FileText className="size-7 text-primary" />
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Docx তৈরি করুন
            </h2>
            <p className="text-sm text-muted-foreground">
              সকল বিসিএস, প্রাইমারি, NTRCA এর বিগত সালের প্রশ্ন বেছে নিয়ে নিজের
              ব্র্যান্ডে প্রিন্ট-রেডি Word ফাইল তৈরি করুন — প্রিন্ট করুন অথবা
              বিক্রি করুন, সম্পূর্ণ ফ্রি।
            </p>
          </div>
        </div>

        {/* Step tracker — gives users a clear sense of progress through the form */}
        <ol className="mb-6 flex items-center gap-1 overflow-x-auto rounded-lg border bg-muted/30 p-2 text-xs sm:text-sm">
          {STEPS.map((label, idx) => {
            const done = idx < currentStep;
            const active = idx === currentStep;
            return (
              <li key={label} className="flex shrink-0 items-center gap-1">
                <span
                  className={`flex items-center gap-1.5 rounded-md px-2 py-1 font-medium ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : done
                        ? "text-primary"
                        : "text-muted-foreground"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="size-3.5 shrink-0" />
                  ) : (
                    <Circle className="size-3.5 shrink-0" />
                  )}
                  {idx + 1}. {label}
                </span>
                {idx < STEPS.length - 1 && (
                  <span className="h-px w-3 shrink-0 bg-border sm:w-6" />
                )}
              </li>
            );
          })}
        </ol>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">১. পরীক্ষার ক্যাটাগরি</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                প্রথমে আপনার পরীক্ষার নাম বেছে নিন (যেমন: বিসিএস, প্রাইমারি,
                ব্যাংক, NTRCA)
              </p>
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
            </div>

            {examSlug && (
              <div className="space-y-2 border-t pt-4">
                <label className="text-sm font-medium">২. সাব-ক্যাটাগরি</label>
                <p className="text-xs text-muted-foreground">
                  এরপর নির্দিষ্ট পরীক্ষার সার্কুলার বা বিভাগ বেছে নিন
                </p>
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
              <div className="space-y-2 border-t pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="text-sm font-medium">
                      ৩. প্রশ্নসেট বেছে নিন (এক বা একাধিক)
                    </label>
                    <p className="text-xs text-muted-foreground">
                      যে সেটগুলো Docx ফাইলে থাকবে সেগুলোতে টিক দিন
                    </p>
                  </div>
                  {questionSets.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectAllQuestionSets}
                    >
                      {selectedSetIds.length === questionSets.length
                        ? "সব বাতিল করুন"
                        : "সব নির্বাচন করুন"}
                    </Button>
                  )}
                </div>
                {loadingQuestionSets ? (
                  <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>
                ) : questionSets.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center">
                    <FolderOpen className="size-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      এই সাব-ক্যাটাগরিতে কোনো প্রশ্নসেট পাওয়া যায়নি
                    </p>
                  </div>
                ) : (
                  <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border p-3">
                    {questionSets.map((set) => {
                      const checked = selectedSetIds.includes(set.id);
                      return (
                        <label
                          key={set.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-md border p-2.5 transition-colors ${
                            checked
                              ? "border-primary/40 bg-primary/5"
                              : "border-transparent hover:bg-muted/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleQuestionSet(set.id)}
                            className="mt-1 size-4 accent-primary"
                          />
                          <div className="min-w-0 flex-1 space-y-1">
                            <span className="block text-sm leading-snug font-medium">
                              {formatQuestionSetLabel(set)}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {set.subject && (
                                <Badge
                                  variant="outline"
                                  className="font-normal"
                                >
                                  {set.subject}
                                </Badge>
                              )}
                              <Badge variant="outline" className="font-normal">
                                {set.totalMarks} নম্বর
                              </Badge>
                              <Badge
                                variant={set.isLive ? "default" : "secondary"}
                                className="font-normal"
                              >
                                {set.isLive ? "লাইভ" : "আর্কাইভ"}
                              </Badge>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}

                {selectedSetIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 rounded-lg bg-muted/40 p-2.5">
                    {questionSets
                      .filter((s) => selectedSetIds.includes(s.id))
                      .map((s) => (
                        <Badge
                          key={s.id}
                          variant="secondary"
                          className="max-w-full gap-1 pr-1 font-normal"
                        >
                          <span className="truncate">{s.title}</span>
                          <button
                            type="button"
                            onClick={() => toggleQuestionSet(s.id)}
                            className="rounded-full p-0.5 hover:bg-background/60"
                            aria-label={`${s.title} বাদ দিন`}
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
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
              <p className="text-xs text-muted-foreground">
                আপনার পছন্দমতো টেমপ্লেট, ব্র্যান্ড নাম ও কলাম সাজিয়ে নিন
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <DocxStylePanel value={styleConfig} onChange={setStyleConfig} />

              <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground sm:text-sm">
                <ShoppingBag className="mt-0.5 size-4 shrink-0 text-primary" />
                <p>
                  তৈরি Docx ফাইলটি নিজের ব্র্যান্ডে{" "}
                  <strong className="text-foreground">প্রিন্ট করে বিতরণ</strong>{" "}
                  করতে পারবেন অথবা{" "}
                  <strong className="text-foreground">বিক্রি</strong> করতে
                  পারবেন — সম্পূর্ণ ফ্রি, কোনো লুকানো শর্ত নেই।
                </p>
                <Printer className="mt-0.5 size-4 shrink-0 text-primary" />
              </div>

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
                  size="lg"
                  className="hidden w-full gap-2 md:flex"
                >
                  <PenLine className="size-4" />
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
