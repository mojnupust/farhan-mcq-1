"use client";

import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
import type { ExamCategory } from "@/features/exam-categories";
import { examCategoryService } from "@/features/exam-categories";
import type { BulkUpsertRoutineItem, Routine } from "@/features/routines";
import { routineService } from "@/features/routines";
import type { SubExamCategory } from "@/features/sub-exam-categories";
import { subExamCategoryService } from "@/features/sub-exam-categories";
import type { Syllabus } from "@/features/syllabus";
import { syllabusService } from "@/features/syllabus";
import { authHeader } from "@/lib/auth-header";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Bot,
  CalendarDays,
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
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// "mistral"/"anthropic"/"gemini"/"openai" call their own official API directly.
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

interface GeneratedDay {
  dayNumber: number;
  date: string; // YYYY-MM-DD
  title: string;
  subject: string;
  topics: string;
  sourceMaterial: string;
  description: string;
  totalMarks: number;
  duration: number;
}

const WEEKDAY_OPTIONS: { value: string; label: string }[] = [
  { value: "none", label: "কোনো ছুটির দিন নেই — প্রতিদিন রুটিন" },
  { value: "5", label: "শুক্রবার ছুটি" },
  { value: "6", label: "শনিবার ছুটি" },
  { value: "0", label: "রবিবার ছুটি" },
  { value: "1", label: "সোমবার ছুটি" },
  { value: "2", label: "মঙ্গলবার ছুটি" },
  { value: "3", label: "বুধবার ছুটি" },
  { value: "4", label: "বৃহস্পতিবার ছুটি" },
];

function todayInputDate(): string {
  return new Date().toISOString().split("T")[0]!;
}

function addDaysToDateString(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0]!;
}

function formatDateBn(dateStr: string): string {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}

function stripTagsPreview(content: string, contentType: string): string {
  const text =
    contentType === "html" ? content.replace(/<[^>]+>/g, " ") : content;
  const collapsed = text
    .replace(/[#*_>\-`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return collapsed.length > 220 ? collapsed.slice(0, 220) + "…" : collapsed;
}

export default function RoutineAiImportPage() {
  // ── Category / sub-category / syllabus selection ──
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [selectedCatId, setSelectedCatId] = useState("");
  const [subCategories, setSubCategories] = useState<SubExamCategory[]>([]);
  const [selectedSubSlug, setSelectedSubSlug] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [selectedSyllabusId, setSelectedSyllabusId] = useState("");
  const [loadingSyllabuses, setLoadingSyllabuses] = useState(false);

  const [existingRoutines, setExistingRoutines] = useState<Routine[]>([]);

  // ── Schedule config ──
  const [startDate, setStartDate] = useState(todayInputDate());
  const [totalDays, setTotalDays] = useState(90);
  const [offWeekday, setOffWeekday] = useState("none");
  const [defaultTotalMarks, setDefaultTotalMarks] = useState(20);
  const [defaultDuration, setDefaultDuration] = useState(10);

  // ── AI model choice — loaded from the same model catalog used for
  // question generation (Mistral, Claude Opus/Sonnet, Gemini Pro, GPT,
  // Local OmniRoute), each flagged available/unavailable depending on
  // which API keys are configured server-side. ──
  const [modelOptions, setModelOptions] = useState<ModelOption[]>([]);
  const [modelOptionsLoading, setModelOptionsLoading] = useState(true);
  const [modelOptionsError, setModelOptionsError] = useState<string | null>(
    null,
  );
  const [selectedModelId, setSelectedModelId] =
    useState<string>("mistral-large");
  const [omniModel, setOmniModel] = useState("auto");

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [days, setDays] = useState<GeneratedDay[] | null>(null);
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  // ── Load exam categories ──
  useEffect(() => {
    (async () => {
      setLoadingCategories(true);
      try {
        const cats = await examCategoryService.getAll();
        setCategories(cats);
        if (cats.length > 0) setSelectedCatId(cats[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCategories(false);
      }
    })();
  }, []);

  // ── Load sub-categories when category changes ──
  useEffect(() => {
    if (!selectedCatId) return;
    const cat = categories.find((c) => c.id === selectedCatId);
    if (!cat) return;
    (async () => {
      try {
        const subs = await subExamCategoryService.getByCategorySlug(cat.slug);
        setSubCategories(subs);
        setSelectedSubSlug(subs.length > 0 ? subs[0]!.slug : "");
      } catch (err) {
        console.error(err);
        setSubCategories([]);
        setSelectedSubSlug("");
      }
    })();
  }, [selectedCatId, categories]);

  const selectedSub = subCategories.find((s) => s.slug === selectedSubSlug);

  // ── Load syllabuses + existing routines for the chosen sub-category ──
  useEffect(() => {
    if (!selectedSubSlug) {
      setSyllabuses([]);
      setSelectedSyllabusId("");
      setExistingRoutines([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingSyllabuses(true);
      try {
        const [syls, routines] = await Promise.all([
          syllabusService.getBySubCategorySlug(selectedSubSlug),
          routineService.getBySubCategorySlug(selectedSubSlug),
        ]);
        if (cancelled) return;
        const activeSyls = syls.filter((s) => s.isActive);
        setSyllabuses(activeSyls);
        setSelectedSyllabusId(activeSyls[0]?.id ?? "");
        setExistingRoutines(routines);

        // Default start date = the day after the latest existing routine
        // for this sub-category, so a re-run continues the plan instead of
        // overlapping it — unless the admin has already typed a date.
        if (routines.length > 0) {
          const maxDate = routines
            .map((r) => r.date.split("T")[0]!)
            .sort()
            .at(-1)!;
          setStartDate(addDaysToDateString(maxDate, 1));
        } else {
          setStartDate(todayInputDate());
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setSyllabuses([]);
          setSelectedSyllabusId("");
          setExistingRoutines([]);
        }
      } finally {
        if (!cancelled) setLoadingSyllabuses(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedSubSlug]);

  // ── Load the full AI model catalog once ──
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

  const selectedModel =
    modelOptions.find((o) => o.id === selectedModelId) ?? null;
  const selectedSyllabus = syllabuses.find((s) => s.id === selectedSyllabusId);
  const examCategoryName = categories.find((c) => c.id === selectedCatId)?.name;

  const existingDates = useMemo(
    () => new Set(existingRoutines.map((r) => r.date.split("T")[0])),
    [existingRoutines],
  );

  const overlapCount = useMemo(
    () => (days ?? []).filter((d) => existingDates.has(d.date)).length,
    [days, existingDates],
  );

  const canGenerate =
    !generating &&
    !!selectedSub &&
    !!selectedSyllabus &&
    !!selectedModel &&
    totalDays >= 1;

  const handleGenerate = async () => {
    if (!selectedSub || !selectedSyllabus || !selectedModel) return;
    setGenerating(true);
    setError(null);
    setWarning(null);
    setDays(null);
    setSavedCount(null);
    try {
      const res = await fetch("/api/ai/generate-routine", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          syllabus: {
            title: selectedSyllabus.title,
            content: selectedSyllabus.content,
            contentType: selectedSyllabus.contentType,
          },
          examCategoryName: examCategoryName || undefined,
          subExamCategoryName: selectedSub.name,
          totalDays,
          startDate,
          offWeekday: offWeekday === "none" ? null : Number(offWeekday),
          defaultTotalMarks,
          defaultDuration,
          provider: selectedModel.provider,
          model:
            selectedModel.provider === "omniroute"
              ? omniModel
              : selectedModel.id,
        }),
      });
      const data = (await res.json()) as {
        routines?: GeneratedDay[];
        error?: string;
        warning?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      setDays(data.routines ?? []);
      if (data.warning) setWarning(data.warning);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "রুটিন তৈরি করতে ব্যর্থ হয়েছে",
      );
    } finally {
      setGenerating(false);
    }
  };

  const updateDay = (idx: number, patch: Partial<GeneratedDay>) => {
    setDays((prev) =>
      prev ? prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)) : null,
    );
  };

  const removeDay = (idx: number) => {
    setDays((prev) => prev?.filter((_, i) => i !== idx) ?? null);
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
    if (!days?.length || !selectedSub) return;
    setSaving(true);
    setError(null);
    try {
      const payload: BulkUpsertRoutineItem[] = days.map((d) => ({
        subExamCategoryId: selectedSub.id,
        date: d.date,
        title: d.title,
        totalMarks: d.totalMarks,
        duration: d.duration,
        subject: d.subject,
        topics: d.topics || undefined,
        sourceMaterial: d.sourceMaterial || undefined,
        description: d.description || undefined,
      }));
      console.log("payload", JSON.stringify(payload, null, 2));
      await routineService.bulkUpsert(payload);
      setSavedCount(payload.length);
      setDays(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "সংরক্ষণ ব্যর্থ হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  const inPreview = days !== null && savedCount === null;
  const inSuccess = savedCount !== null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      {/* ── Header ── */}
      <div className="mb-6 flex items-start gap-3">
        <Button variant="ghost" size="icon" asChild className="mt-0.5 shrink-0">
          <Link href="/admin/routines" aria-label="ফিরে যান">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <AdminPageHeader
          title="AI দিয়ে রুটিন তৈরি করুন"
          subtitle="সিলেবাস বেছে নিন, দিন সংখ্যা দিন — AI পুরো সিলেবাস কভার করে একটি ধারাবাহিক রুটিন বানাবে"
          icon={<Bot className="size-5" />}
        />
      </div>

      {error && (
        <div className="mb-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {warning && (
        <div className="mb-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{warning}</span>
        </div>
      )}

      {inSuccess && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
          <CheckCircle className="size-4 shrink-0" />
          <span>
            <strong>{savedCount}</strong> দিনের রুটিন সফলভাবে সংরক্ষিত হয়েছে!
          </span>
          <Link
            href="/admin/routines"
            className="ml-auto font-medium underline underline-offset-2"
          >
            রুটিন দেখুন →
          </Link>
        </div>
      )}

      {/* ── Input Phase ── */}
      {!inPreview && (
        <div className="space-y-4">
          <AdminFilterBar
            filters={[
              {
                id: "exam-category",
                label: "পরীক্ষার ক্যাটাগরি",
                placeholder: "নির্বাচন করুন",
                value: selectedCatId,
                onChange: setSelectedCatId,
                options: categories.map((c) => ({
                  value: c.id,
                  label: c.name,
                })),
              },
              {
                id: "sub-exam-category",
                label: "সাব-ক্যাটাগরি",
                placeholder: "নির্বাচন করুন",
                value: selectedSubSlug,
                onChange: setSelectedSubSlug,
                options: subCategories.map((s) => ({
                  value: s.slug,
                  label: s.name,
                })),
              },
            ]}
          />

          {/* ── Syllabus picker ── */}
          <div>
            <Label className="mb-1.5 block font-medium">
              সিলেবাস
              {loadingSyllabuses && (
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  লোড হচ্ছে…
                </span>
              )}
            </Label>
            {loadingCategories ? (
              <div className="flex items-center gap-2 rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                ক্যাটাগরি লোড হচ্ছে…
              </div>
            ) : syllabuses.length === 0 && !loadingSyllabuses ? (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>
                  এই সাব-ক্যাটাগরির জন্য কোনো সক্রিয় সিলেবাস পাওয়া যায়নি।{" "}
                  <Link
                    href="/admin/syllabus"
                    className="font-medium underline"
                  >
                    আগে সিলেবাস যোগ করুন →
                  </Link>
                </span>
              </div>
            ) : (
              <Select
                value={selectedSyllabusId}
                onValueChange={setSelectedSyllabusId}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="সিলেবাস নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {syllabuses.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedSyllabus && (
              <div className="mt-2 flex items-start gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                <BookOpen className="mt-0.5 size-3.5 shrink-0" />
                <span>
                  {stripTagsPreview(
                    selectedSyllabus.content,
                    selectedSyllabus.contentType,
                  )}
                </span>
              </div>
            )}
            {existingRoutines.length > 0 && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                এই সাব-ক্যাটাগরিতে ইতিমধ্যে {existingRoutines.length}টি রুটিন
                আছে — শেষ তারিখের পরের দিন থেকে ডিফল্ট শুরুর তারিখ বসানো হয়েছে।
              </p>
            )}
          </div>

          {/* ── Schedule config ── */}
          <div className="rounded-xl border p-4">
            <Label className="mb-3 flex items-center gap-1.5 font-medium">
              <CalendarDays className="size-4" />
              সময়সূচি
            </Label>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <Label htmlFor="start-date" className="mb-1.5 block text-xs">
                  শুরুর তারিখ
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="total-days" className="mb-1.5 block text-xs">
                  মোট দিন সংখ্যা
                </Label>
                <Input
                  id="total-days"
                  type="number"
                  min={1}
                  max={365}
                  value={totalDays}
                  onChange={(e) =>
                    setTotalDays(
                      Math.min(365, Math.max(1, parseInt(e.target.value) || 1)),
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="default-marks" className="mb-1.5 block text-xs">
                  দৈনিক মোট নম্বর
                </Label>
                <Input
                  id="default-marks"
                  type="number"
                  min={1}
                  max={200}
                  value={defaultTotalMarks}
                  onChange={(e) =>
                    setDefaultTotalMarks(
                      Math.max(1, parseInt(e.target.value) || 1),
                    )
                  }
                />
              </div>
              <div>
                <Label
                  htmlFor="default-duration"
                  className="mb-1.5 block text-xs"
                >
                  দৈনিক সময় (মিনিট)
                </Label>
                <Input
                  id="default-duration"
                  type="number"
                  min={1}
                  max={300}
                  value={defaultDuration}
                  onChange={(e) =>
                    setDefaultDuration(
                      Math.max(1, parseInt(e.target.value) || 1),
                    )
                  }
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="off-weekday" className="mb-1.5 block text-xs">
                সাপ্তাহিক ছুটি
              </Label>
              <Select value={offWeekday} onValueChange={setOffWeekday}>
                <SelectTrigger id="off-weekday" className="h-9 w-full sm:w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1.5 text-xs text-muted-foreground">
                ছুটির দিন গোনায় ধরা হবে না — অর্থাৎ {totalDays} দিনের রুটিন
                পেতে ছুটি বাদে {totalDays} কার্যদিবস লাগবে, ক্যালেন্ডারে তার
                চেয়ে বেশি সময় লাগতে পারে।
              </p>
            </div>
          </div>

          {/* ── AI model picker ── */}
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

          <div className="flex items-center gap-3">
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="gap-2"
            >
              {generating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {generating
                ? "AI রুটিন তৈরি করছে…"
                : `AI দিয়ে ${totalDays} দিনের রুটিন তৈরি করুন`}
            </Button>
            {generating && (
              <p className="text-sm text-muted-foreground">
                দিন সংখ্যা বেশি হলে একাধিক ব্যাচে সময় নিতে পারে…
              </p>
            )}
          </div>

          <div className="rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground space-y-1.5">
            <p className="text-sm font-medium text-foreground">💡 টিপস</p>
            <p>
              • পুরো সিলেবাসের কনটেন্ট AI-কে দেওয়া হয় — সে পুরো সময়সীমার
              মধ্যে সিলেবাসের সবকিছু যৌক্তিকভাবে ভাগ করে দেবে
            </p>
            <p>
              • সম্পর্কিত টপিকগুলো কাছাকাছি দিনে রাখা হয়, একদিনে একাধিক টপিক
              থাকতে পারে
            </p>
            <p>• শেষের প্রায় ১০% দিন স্বয়ংক্রিয়ভাবে রিভিশন/মডেল টেস্ট হবে</p>
            <p>• সংরক্ষণের আগে প্রতিটি দিন সম্পাদনা বা বাদ দেওয়া যাবে</p>
          </div>
        </div>
      )}

      {/* ── Preview Phase ── */}
      {inPreview && days && (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-green-500" />
              <span className="font-medium">
                {days.length}টি দিনের রুটিন তৈরি হয়েছে
              </span>
              <span className="text-sm text-muted-foreground">
                — সংরক্ষণের আগে যাচাই করুন
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDays(null)}
                className="gap-1.5"
              >
                <RefreshCw className="size-3.5" />
                পুনরায় তৈরি
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving || days.length === 0}
                className="gap-1.5"
              >
                {saving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                {saving ? "সংরক্ষণ হচ্ছে…" : `সংরক্ষণ করুন (${days.length})`}
              </Button>
            </div>
          </div>

          {overlapCount > 0 && (
            <div className="mb-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>
                {overlapCount}টি দিনের তারিখে এই সাব-ক্যাটাগরিতে আগে থেকেই রুটিন
                আছে — সংরক্ষণ করলে সেগুলো ডুপ্লিকেট হিসেবে যোগ হবে (আপডেট হবে
                না)।
              </span>
            </div>
          )}

          <div className="space-y-2">
            {days.map((d, idx) => {
              const hasOverlap = existingDates.has(d.date);
              return (
                <div
                  key={idx}
                  className="overflow-hidden rounded-xl border border-border bg-card"
                >
                  <div className="flex items-start gap-3 px-4 py-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {d.dayNumber}
                    </span>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className="text-xs font-normal"
                        >
                          {formatDateBn(d.date)}
                        </Badge>
                        {hasOverlap && (
                          <Badge
                            variant="outline"
                            className="border-amber-300 text-xs text-amber-700 dark:text-amber-400"
                          >
                            আগে থেকে আছে
                          </Badge>
                        )}
                      </div>

                      <Input
                        value={d.title}
                        onChange={(e) =>
                          updateDay(idx, { title: e.target.value })
                        }
                        className="text-sm font-medium"
                        placeholder="শিরোনাম"
                      />

                      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                        <Input
                          value={d.subject}
                          onChange={(e) =>
                            updateDay(idx, { subject: e.target.value })
                          }
                          className="text-xs"
                          placeholder="বিষয়"
                        />
                        <Input
                          value={d.topics}
                          onChange={(e) =>
                            updateDay(idx, { topics: e.target.value })
                          }
                          className="text-xs"
                          placeholder="টপিক"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <Label className="text-xs text-muted-foreground">
                            নম্বর
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            value={d.totalMarks}
                            onChange={(e) =>
                              updateDay(idx, {
                                totalMarks: Math.max(
                                  1,
                                  parseInt(e.target.value) || 1,
                                ),
                              })
                            }
                            className="h-7 w-20 text-xs"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Label className="text-xs text-muted-foreground">
                            সময় (মি.)
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            value={d.duration}
                            onChange={(e) =>
                              updateDay(idx, {
                                duration: Math.max(
                                  1,
                                  parseInt(e.target.value) || 1,
                                ),
                              })
                            }
                            className="h-7 w-20 text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        onClick={() => toggleExpand(idx)}
                        className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title={
                          expandedSet.has(idx) ? "বর্ণনা লুকান" : "বর্ণনা দেখুন"
                        }
                      >
                        {expandedSet.has(idx) ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )}
                      </button>
                      <button
                        onClick={() => removeDay(idx)}
                        className="rounded p-1.5 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        title="এই দিন বাদ দিন"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>

                  {expandedSet.has(idx) && (
                    <div className="space-y-2 border-t border-border bg-muted/20 px-4 py-3">
                      <div>
                        <p className="mb-1 text-xs font-medium text-muted-foreground">
                          বর্ণনা
                        </p>
                        <Textarea
                          value={d.description}
                          onChange={(e) =>
                            updateDay(idx, { description: e.target.value })
                          }
                          rows={2}
                          className="text-xs"
                        />
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium text-muted-foreground">
                          উৎস
                        </p>
                        <Input
                          value={d.sourceMaterial}
                          onChange={(e) =>
                            updateDay(idx, { sourceMaterial: e.target.value })
                          }
                          className="text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {days.length > 0 && (
            <div className="sticky bottom-4 mt-6 flex justify-end">
              <div className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-lg">
                <span className="text-sm text-muted-foreground">
                  {days.length}টি দিন প্রস্তুত
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

      {!selectedSub && !loadingCategories && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          <span>শুরু করতে উপরে একটি পরীক্ষার সাব-ক্যাটাগরি নির্বাচন করুন।</span>
        </div>
      )}
    </div>
  );
}
