"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { examCategoryService } from "@/features/exam-categories";
import type {
  BulkUpsertQuestionItem,
  QuestionSet,
} from "@/features/question-sets";
import { questionSetService } from "@/features/question-sets";
import { subExamCategoryService } from "@/features/sub-exam-categories";
import { authHeader } from "@/lib/auth-header";
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Cloud,
  Info,
  Loader2,
  RefreshCw,
  Save,
  Server,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

// "mistral"/"anthropic"/"gemini" call their own official API directly.
// "omniroute" is a self-hosted local gateway used only for ITS OWN
// free/local models — never as a proxy for the official integrations above.
type AiProvider = "mistral" | "omniroute" | "anthropic" | "gemini" | "openai";

interface ModelOption {
  id: string;
  provider: AiProvider;
  label: string;
  available: boolean;
  subModels?: string[]; // only populated for the "omniroute" entry
}

interface ParsedQuestion {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  examName: string;
  subject: string;
  topic: string;
  subTopic: string;
  frequencyTag: string;
  sortOrder: number;
}

const ANSWER_LABELS: Record<string, string> = {
  A: "ক",
  B: "খ",
  C: "গ",
  D: "ঘ",
};

// Used only when a set has already hit (or exceeded) its mark-based target
// but the user still wants to generate a few more questions manually.
const FALLBACK_BATCH_COUNT = 10;

export default function AiImportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: questionSetId } = use(params);

  // ── Question set context (auto-loaded — replaces the old manual subject field) ──
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [examCategoryName, setExamCategoryName] = useState("");
  const [subExamCategoryName, setSubExamCategoryName] = useState("");
  const [existingCount, setExistingCount] = useState(0);
  const [loadingContext, setLoadingContext] = useState(true);
  const [contextError, setContextError] = useState<string | null>(null);

  // ── AI model choice — loaded from the model catalog (Mistral, Claude
  // Opus/Sonnet, Gemini Pro, Local OmniRoute), each flagged available/
  // unavailable depending on which API keys are configured server-side.
  const [modelOptions, setModelOptions] = useState<ModelOption[]>([]);
  const [modelOptionsLoading, setModelOptionsLoading] = useState(true);
  const [modelOptionsError, setModelOptionsError] = useState<string | null>(
    null,
  );
  const [selectedModelId, setSelectedModelId] =
    useState<string>("mistral-large");
  const [omniModel, setOmniModel] = useState("auto");

  const [rawText, setRawText] = useState("");
  const [startSortOrder, setStartSortOrder] = useState(1);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ParsedQuestion[] | null>(null);
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  // Load the question set + its exam/sub-exam category names + how many
  // questions already exist, so subject/topics/source/target-count are all
  // known automatically instead of being typed in by hand.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadingContext(true);
      setContextError(null);
      try {
        const [qs, existingQuestions, categories] = await Promise.all([
          questionSetService.getById(questionSetId),
          questionSetService.getQuestions(questionSetId),
          examCategoryService.getAll(),
        ]);
        if (cancelled) return;

        setQuestionSet(qs);
        setExistingCount(existingQuestions.length);
        setStartSortOrder(existingQuestions.length + 1);

        for (const cat of categories) {
          const subs = await subExamCategoryService.getByCategorySlug(cat.slug);
          const match = subs.find((s) => s.id === qs.subExamCategoryId);
          if (match) {
            if (!cancelled) {
              setExamCategoryName(cat.name);
              setSubExamCategoryName(match.name);
            }
            break;
          }
        }
      } catch (err) {
        if (!cancelled) {
          setContextError(
            err instanceof Error
              ? err.message
              : "প্রশ্নসেটের তথ্য লোড করতে ব্যর্থ হয়েছে",
          );
        }
      } finally {
        if (!cancelled) setLoadingContext(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [questionSetId]);

  // Load the full model catalog once — Mistral, Claude Opus/Sonnet, Gemini
  // Pro (shown even before their keys are configured, greyed out until they
  // are) plus OmniRoute's own live sub-model list.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setModelOptionsLoading(true);
      setModelOptionsError(null);
      try {
        const res = await fetch("/api/ai/model-catalog", {
          headers: authHeader(),
        });
        const data = (await res.json()) as {
          options?: ModelOption[];
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok)
          throw new Error(data.error ?? "মডেল তালিকা লোড ব্যর্থ হয়েছে");
        const options = data.options ?? [];
        setModelOptions(options);
        // Default to the first available model rather than whatever
        // happens to be first in the list (e.g. skip an unconfigured one).
        const firstAvailable = options.find((o) => o.available);
        if (firstAvailable) setSelectedModelId(firstAvailable.id);
      } catch (err) {
        if (!cancelled) {
          setModelOptionsError(
            err instanceof Error
              ? err.message
              : "মডেল তালিকা লোড ব্যর্থ হয়েছে",
          );
        }
      } finally {
        if (!cancelled) setModelOptionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalNeeded = questionSet
    ? Math.max(
        1,
        Math.round(questionSet.totalMarks / questionSet.markPerQuestion),
      )
    : 0;
  const targetCount = questionSet
    ? Math.max(0, totalNeeded - existingCount)
    : 0;

  const selectedModel =
    modelOptions.find((o) => o.id === selectedModelId) ?? null;

  const handleParse = async () => {
    if (!rawText.trim() || !questionSet || !selectedModel) return;
    setParsing(true);
    setError(null);
    setWarning(null);
    setQuestions(null);
    setSavedCount(null);
    try {
      const res = await fetch("/api/ai/parse-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          rawText,
          startSortOrder,
          expectedCount: targetCount > 0 ? targetCount : FALLBACK_BATCH_COUNT,
          provider: selectedModel.provider,
          model:
            selectedModel.provider === "omniroute"
              ? omniModel
              : selectedModel.id,
          questionSet: {
            subject: questionSet.subject,
            topics: questionSet.topics,
            sourceMaterial: questionSet.sourceMaterial,
            title: questionSet.title,
            examCategoryName: examCategoryName || undefined,
            subExamCategoryName: subExamCategoryName || undefined,
          },
        }),
      });
      const data = (await res.json()) as {
        questions?: ParsedQuestion[];
        error?: string;
        warning?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      setQuestions(data.questions ?? []);
      if (data.warning) setWarning(data.warning);
    } catch (err) {
      setError(err instanceof Error ? err.message : "পার্স করতে ব্যর্থ হয়েছে");
    } finally {
      setParsing(false);
    }
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev?.filter((_, i) => i !== idx) ?? null);
    setExpandedSet((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i < idx) next.add(i);
        else if (i > idx) next.add(i - 1);
      });
      return next;
    });
  };

  const toggleExpand = (idx: number) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleSave = async () => {
    if (!questions?.length) return;
    setSaving(true);
    setError(null);
    try {
      const payload: BulkUpsertQuestionItem[] = questions.map((q) => ({
        questionSetId,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || undefined,
        examName: q.examName || undefined,
        subject: q.subject || undefined,
        topic: q.topic || undefined,
        subTopic: q.subTopic || undefined,
        frequencyTag: q.frequencyTag || undefined,
        sortOrder: q.sortOrder,
      }));
      await questionSetService.bulkUpsertQuestions(payload);
      setSavedCount(payload.length);
      setQuestions(null);
      setRawText("");
      setWarning(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "সংরক্ষণ ব্যর্থ হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  const inPreview = questions !== null && savedCount === null;
  const inSuccess = savedCount !== null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      {/* ── Header ── */}
      <div className="mb-6 flex items-start gap-3">
        <Button variant="ghost" size="icon" asChild className="mt-0.5 shrink-0">
          <Link
            href={`/admin/question-sets/${questionSetId}/questions`}
            aria-label="ফিরে যান"
          >
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Bot className="size-5 text-primary" />
            AI দিয়ে প্রশ্ন তৈরি করুন
          </h1>
          <p className="text-sm text-muted-foreground">
            অগোছালো টেক্সট বা রেফারেন্স বই থেকে টপিক পেস্ট করুন — AI এই সেটের
            বিষয়/টপিক/উৎস অনুযায়ী প্রশ্ন তৈরি করবে
          </p>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="mb-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Warning Banner ── */}
      {warning && (
        <div className="mb-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{warning}</span>
        </div>
      )}

      {/* ── Success Banner ── */}
      {inSuccess && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
          <CheckCircle className="size-4 shrink-0" />
          <span>
            <strong>{savedCount}</strong> টি প্রশ্ন সফলভাবে সংরক্ষিত হয়েছে!
          </span>
          <Link
            href={`/admin/question-sets/${questionSetId}/questions`}
            className="ml-auto font-medium underline underline-offset-2"
          >
            প্রশ্ন দেখুন →
          </Link>
        </div>
      )}

      {/* ── Input Phase ── */}
      {!inPreview && (
        <div className="space-y-4">
          {/* ── Question set context card (auto-loaded, read-only) ── */}
          {loadingContext ? (
            <div className="flex items-center gap-2 rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              প্রশ্নসেটের তথ্য লোড হচ্ছে…
            </div>
          ) : contextError ? (
            <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{contextError}</span>
            </div>
          ) : questionSet ? (
            <div className="rounded-xl border bg-muted/30 p-4 text-sm space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Info className="size-3.5 text-muted-foreground" />
                {examCategoryName && <Badge>{examCategoryName}</Badge>}
                {subExamCategoryName && (
                  <Badge variant="secondary">{subExamCategoryName}</Badge>
                )}
                <Badge variant="outline">{questionSet.subject}</Badge>
              </div>
              {questionSet.topics && (
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">টপিক: </span>
                  {questionSet.topics}
                </p>
              )}
              {questionSet.sourceMaterial && (
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">উৎস: </span>
                  {questionSet.sourceMaterial}
                </p>
              )}
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">প্রয়োজন: </span>
                মোট {totalNeeded} টি প্রশ্ন ({questionSet.totalMarks} মার্ক ÷{" "}
                {questionSet.markPerQuestion} মার্ক/প্রশ্ন)
                {existingCount > 0 &&
                  ` — ইতিমধ্যে ${existingCount} টি আছে, বাকি ${targetCount} টি`}
                {targetCount === 0 &&
                  existingCount > 0 &&
                  " — সেট সম্পূর্ণ, চাইলে আরও যোগ করতে পারেন"}
              </p>
            </div>
          ) : null}

          <div>
            <Label htmlFor="raw-text" className="mb-1.5 block font-medium">
              অগোছালো টেক্সট / রেফারেন্স কনটেন্ট
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                OCR, PDF কপি, স্ক্যান, তৈরি প্রশ্ন, অথবা শুধু ব্যাখ্যামূলক
                টেক্সট — যেকোনো ফরম্যাট
              </span>
            </Label>
            <Textarea
              id="raw-text"
              rows={18}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="resize-y font-mono text-xs"
              placeholder={`যেকোনো ফরম্যাটে টেক্সট পেস্ট করুন — তৈরি প্রশ্ন হলে AI বের করে নেবে, শুধু ব্যাখ্যা/নিয়ম হলে AI নতুন প্রশ্ন তৈরি করবে।`}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="max-w-xs">
              <Label htmlFor="start-order" className="mb-1.5 block">
                শুরুর ক্রম নম্বর
              </Label>
              <Input
                id="start-order"
                type="number"
                min={1}
                value={startSortOrder}
                onChange={(e) =>
                  setStartSortOrder(Math.max(1, parseInt(e.target.value) || 1))
                }
              />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block">
              AI মডেল
              {modelOptionsLoading && (
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  লোড হচ্ছে…
                </span>
              )}
            </Label>
            {modelOptionsError ? (
              <p className="text-xs text-red-600 dark:text-red-400">
                {modelOptionsError}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {modelOptions.map((option) => {
                  const isSelected = option.id === selectedModelId;
                  const Icon = option.provider === "omniroute" ? Server : Cloud;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={!option.available}
                      onClick={() => setSelectedModelId(option.id)}
                      title={
                        option.available
                          ? undefined
                          : "এই মডেলের জন্য API key কনফিগার করা নেই — .env.local এ যোগ করুন"
                      }
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                        !option.available
                          ? "cursor-not-allowed border-dashed opacity-50"
                          : isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-transparent text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="size-3.5" />
                      {option.label}
                      {!option.available && (
                        <span className="text-[10px] font-normal">
                          (key লাগবে)
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedModel?.provider === "omniroute" && (
            <div className="max-w-xs">
              <Label className="mb-1.5 block">OmniRoute মডেল</Label>
              <Select value={omniModel} onValueChange={setOmniModel}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="auto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    auto (zero-config smart routing)
                  </SelectItem>
                  {(selectedModel.subModels ?? []).map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedModel?.provider === "omniroute" && (
            <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              Local (OmniRoute) ফ্রি ও নতুন মডেল দ্রুত যোগ করা যায়, কিন্তু
              আউটপুট মানের নিশ্চয়তা ততটা নয় — এবং এই সার্ভারটি যেখানে চলছে
              সেখান থেকে OmniRoute পৌঁছানো সম্ভব হতে হবে (লোকাল ডেভে ঠিক আছে;
              Vercel-এ deploy করা থাকলে OmniRoute Remote Mode লাগবে)।
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button
              onClick={handleParse}
              disabled={
                parsing || !rawText.trim() || !questionSet || !selectedModel
              }
              className="gap-2"
            >
              {parsing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {parsing
                ? "AI প্রশ্ন তৈরি করছে…"
                : `AI দিয়ে ${targetCount > 0 ? targetCount : FALLBACK_BATCH_COUNT} টি প্রশ্ন তৈরি করুন`}
            </Button>
            {parsing && (
              <p className="text-sm text-muted-foreground">
                বেশি প্রশ্ন হলে একাধিক ব্যাচে সময় নিতে পারে…
              </p>
            )}
          </div>

          <div className="rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground space-y-1.5">
            <p className="text-sm font-medium text-foreground">💡 টিপস</p>
            <p>
              • বিষয়, টপিক, উৎস ও কতটি প্রশ্ন লাগবে — সবকিছু এই প্রশ্নসেট থেকেই
              স্বয়ংক্রিয়ভাবে নেওয়া হয়, আলাদা করে লেখার দরকার নেই
            </p>
            <p>• তৈরি প্রশ্ন পেস্ট করলে AI সেগুলো চিনে বের করে নেবে</p>
            <p>
              • শুধু নিয়ম/সংজ্ঞা/ব্যাখ্যা পেস্ট করলেও AI সেখান থেকে নতুন
              মানসম্মত প্রশ্ন তৈরি করবে
            </p>
            <p>• &ldquo;উ. ক/খ/গ/ঘ&rdquo; মার্কার থেকে সঠিক উত্তর সনাক্ত হবে</p>
            <p>• ব্যাখ্যা না থাকলেও AI বিস্তারিত ব্যাখ্যা তৈরি করবে</p>
          </div>
        </div>
      )}

      {/* ── Preview Phase ── */}
      {inPreview && questions && (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-green-500" />
              <span className="font-medium">
                {questions.length} টি প্রশ্ন তৈরি হয়েছে
              </span>
              <span className="text-sm text-muted-foreground">
                — সংরক্ষণের আগে যাচাই করুন
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuestions(null)}
                className="gap-1.5"
              >
                <RefreshCw className="size-3.5" />
                পুনরায় পার্স
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || questions.length === 0}
                className="gap-1.5"
              >
                {saving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                {saving
                  ? "সংরক্ষণ হচ্ছে…"
                  : `সংরক্ষণ করুন (${questions.length})`}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {questions.map((q, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <div className="flex items-start gap-3 px-4 py-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {q.sortOrder}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">
                      {q.questionText}
                    </p>

                    <div className="mt-2 grid grid-cols-2 gap-1">
                      {(["A", "B", "C", "D"] as const).map((key) => {
                        const optKey = `option${key}` as keyof ParsedQuestion;
                        const text = q[optKey] as string;
                        const isCorrect = q.correctAnswer === key;
                        return (
                          <div
                            key={key}
                            className={`flex items-start gap-1.5 rounded-lg px-2.5 py-1.5 text-xs ${
                              isCorrect
                                ? "bg-green-50 font-semibold text-green-800 dark:bg-green-900/20 dark:text-green-200"
                                : "bg-muted/50 text-muted-foreground"
                            }`}
                          >
                            <span
                              className={`shrink-0 font-bold ${
                                isCorrect
                                  ? "text-green-600 dark:text-green-400"
                                  : ""
                              }`}
                            >
                              {ANSWER_LABELS[key]})
                            </span>
                            <span className="wrap-break-word">{text}</span>
                          </div>
                        );
                      })}
                    </div>

                    {(q.examName || q.subject || q.topic || q.frequencyTag) && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {q.examName && (
                          <Badge className="text-xs">{q.examName}</Badge>
                        )}
                        {q.subject && (
                          <Badge variant="secondary" className="text-xs">
                            {q.subject}
                          </Badge>
                        )}
                        {q.topic && (
                          <Badge variant="outline" className="text-xs">
                            {q.topic}
                          </Badge>
                        )}
                        {q.frequencyTag && (
                          <Badge
                            variant="outline"
                            className="gap-1 border-amber-300 text-xs text-amber-700 dark:text-amber-400"
                          >
                            <Star className="size-3" />
                            {q.frequencyTag}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      onClick={() => toggleExpand(idx)}
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title={
                        expandedSet.has(idx)
                          ? "ব্যাখ্যা লুকান"
                          : "ব্যাখ্যা দেখুন"
                      }
                    >
                      {expandedSet.has(idx) ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </button>
                    <button
                      onClick={() => removeQuestion(idx)}
                      className="rounded p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      title="এই প্রশ্ন বাদ দিন"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                {expandedSet.has(idx) && (
                  <div className="border-t border-border bg-muted/20 px-4 py-3">
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                      ব্যাখ্যা
                    </p>
                    <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-card-foreground">
                      {q.explanation || "(কোনো ব্যাখ্যা নেই)"}
                    </pre>
                    {q.subTopic && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        সাব-টপিক:{" "}
                        <span className="font-medium">{q.subTopic}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {questions.length > 0 && (
            <div className="sticky bottom-4 mt-6 flex justify-end">
              <div className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-lg">
                <span className="text-sm text-muted-foreground">
                  {questions.length} টি প্রশ্ন প্রস্তুত
                </span>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="gap-2"
                >
                  {saving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  {saving ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
