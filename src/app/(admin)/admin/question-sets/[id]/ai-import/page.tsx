"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BulkUpsertQuestionItem } from "@/features/question-sets";
import { questionSetService } from "@/features/question-sets";
import {
  AlertCircle,
  ArrowLeft,
  Bot,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";

interface ParsedQuestion {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  subject: string;
  topic: string;
  subTopic: string;
  sortOrder: number;
}

const ANSWER_LABELS: Record<string, string> = {
  A: "ক",
  B: "খ",
  C: "গ",
  D: "ঘ",
};

export default function AiImportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: questionSetId } = use(params);

  const [rawText, setRawText] = useState("");
  const [subjectHint, setSubjectHint] = useState("");
  const [startSortOrder, setStartSortOrder] = useState(1);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ParsedQuestion[] | null>(null);
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setParsing(true);
    setError(null);
    setWarning(null);
    setQuestions(null);
    setSavedCount(null);
    try {
      const res = await fetch("/api/ai/parse-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText, subjectHint, startSortOrder }),
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
        subject: q.subject || undefined,
        topic: q.topic || undefined,
        subTopic: q.subTopic || undefined,
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
            অগোছালো প্রশ্নের টেক্সট পেস্ট করুন — AI ফরম্যাট করে ডেটাবেজে পাঠাবে
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
          {/* Raw text area */}
          <div>
            <Label htmlFor="raw-text" className="mb-1.5 block font-medium">
              অগোছালো প্রশ্নের টেক্সট
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                OCR, PDF কপি, স্ক্যান — যেকোনো ফরম্যাট
              </span>
            </Label>
            <Textarea
              id="raw-text"
              rows={18}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="resize-y font-mono text-xs"
              placeholder={`যেকোনো ফরম্যাটে প্রশ্ন পেস্ট করুন। উদাহরণ:\n\n১. 'বনস্পতি' শব্দটির সন্ধি বিচ্ছেদ কোনটি?\n@ বনস + পতি\n@ বনঃ + পতি\n@ বন + পতি\n® বনো + পতি\nউ. খ\nব্যাখ্যা: নিপাতনে সিদ্ধ সন্ধি...\n\n২. 'চতুষ্পদ' শব্দটির সন্ধি বিচ্ছেদ কোনটি?\n© চতুর + পদ\n¬ চতু + পদ\n@ চতুষ + পদ\n® চতুঃ + পদ\nউ. ঘ`}
            />
          </div>

          {/* Hints row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="subject-hint" className="mb-1.5 block">
                বিষয় সংকেত
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  (ঐচ্ছিক — AI স্বয়ংক্রিয়ভাবে সনাক্ত করবে)
                </span>
              </Label>
              <Input
                id="subject-hint"
                value={subjectHint}
                onChange={(e) => setSubjectHint(e.target.value)}
                placeholder="যেমন: বাংলা ভাষা ও সাহিত্য"
              />
            </div>
            <div>
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

          {/* Parse button */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleParse}
              disabled={parsing || !rawText.trim()}
              className="gap-2"
            >
              {parsing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {parsing ? "AI পার্স করছে…" : "AI দিয়ে পার্স করুন"}
            </Button>
            {parsing && (
              <p className="text-sm text-muted-foreground">
                কয়েক সেকেন্ড অপেক্ষা করুন…
              </p>
            )}
          </div>

          {/* Tips panel */}
          <div className="rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground space-y-1.5">
            <p className="text-sm font-medium text-foreground">💡 টিপস</p>
            <p>
              • সেরা ফলাফলের জন্য একবারে <strong>২০–২৫ টি প্রশ্ন</strong> পার্স
              করুন
            </p>
            <p>
              • OCR টেক্সটের @, ©, ®, ¬ চিহ্নগুলো AI স্বয়ংক্রিয়ভাবে সরিয়ে
              নেবে
            </p>
            <p>• "উ. ক/খ/গ/ঘ" মার্কার থেকে সঠিক উত্তর সনাক্ত হবে</p>
            <p>• ব্যাখ্যা না থাকলেও AI বিস্তারিত ব্যাখ্যা তৈরি করবে</p>
            <p>• Gemini Free Tier: ১৫ req/min, ১৫০০ req/day</p>
          </div>
        </div>
      )}

      {/* ── Preview Phase ── */}
      {inPreview && questions && (
        <div>
          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-green-500" />
              <span className="font-medium">
                {questions.length} টি প্রশ্ন পার্স হয়েছে
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

          {/* Question cards */}
          <div className="space-y-2">
            {questions.map((q, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                {/* Card header */}
                <div className="flex items-start gap-3 px-4 py-3">
                  {/* Sort order badge */}
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {q.sortOrder}
                  </span>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">
                      {q.questionText}
                    </p>

                    {/* Options 2×2 */}
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

                    {/* Subject / topic tags */}
                    {(q.subject || q.topic) && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
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
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
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

                {/* Expandable explanation */}
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

          {/* Sticky save bar at bottom */}
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
