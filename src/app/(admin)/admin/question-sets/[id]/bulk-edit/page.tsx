"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  BulkUpsertQuestionItem,
  Question,
  QuestionSet,
} from "@/features/question-sets";
import { questionSetService } from "@/features/question-sets";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { use, useCallback, useEffect, useRef, useState } from "react";

// ─── Row state ─────────────────────────────────────────────────────────────

interface RowData {
  /** Temporary client-side key (never sent to server) */
  _key: string;
  /** Undefined → new (not yet saved) */
  id: string | undefined;
  questionSetId: string;
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
  frequencyTag: string;
  slug: string;
  sortOrder: number;
  /** true if modified since last save */
  dirty: boolean;
  /** expand explanation row */
  expanded: boolean;
  selected: boolean;
}

let _keyCounter = 0;
function nextKey() {
  return `row-${++_keyCounter}`;
}

function questionToRow(q: Question, questionSetId: string): RowData {
  return {
    _key: nextKey(),
    id: q.id,
    questionSetId,
    questionText: q.questionText,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation ?? "",
    subject: q.subject ?? "",
    topic: q.topic ?? "",
    subTopic: q.subTopic ?? "",
    frequencyTag: q.frequencyTag ?? "",
    slug: q.slug ?? "",
    sortOrder: q.sortOrder,
    dirty: false,
    expanded: false,
    selected: false,
  };
}

function emptyRow(questionSetId: string, sortOrder: number): RowData {
  return {
    _key: nextKey(),
    id: undefined,
    questionSetId,
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    explanation: "",
    subject: "",
    topic: "",
    subTopic: "",
    frequencyTag: "",
    slug: "",
    sortOrder,
    dirty: true,
    expanded: false,
    selected: false,
  };
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function BulkEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: questionSetId } = use(params);

  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [rows, setRows] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  // Track original IDs for detecting truly removed rows
  const originalIds = useRef<Set<string>>(new Set());

  // ── Load ────────────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const [qs, questions] = await Promise.all([
          questionSetService.getById(questionSetId),
          questionSetService.getQuestions(questionSetId),
        ]);
        setQuestionSet(qs);
        const loaded = questions.map((q) => questionToRow(q, questionSetId));
        setRows(loaded);
        originalIds.current = new Set(questions.map((q) => q.id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [questionSetId]);

  // ── Helpers ─────────────────────────────────────────────────────────────

  const updateRow = useCallback((key: string, patch: Partial<RowData>) => {
    setRows((prev) =>
      prev.map((r) => (r._key === key ? { ...r, ...patch, dirty: true } : r)),
    );
  }, []);

  const toggleExpand = useCallback((key: string) => {
    setRows((prev) =>
      prev.map((r) => (r._key === key ? { ...r, expanded: !r.expanded } : r)),
    );
  }, []);

  const toggleSelect = useCallback((key: string) => {
    setRows((prev) =>
      prev.map((r) => (r._key === key ? { ...r, selected: !r.selected } : r)),
    );
  }, []);

  const toggleSelectAll = useCallback((checked: boolean) => {
    setRows((prev) => prev.map((r) => ({ ...r, selected: checked })));
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, emptyRow(questionSetId, prev.length + 1)]);
  }, [questionSetId]);

  const removeRowLocally = useCallback((key: string) => {
    setRows((prev) => prev.filter((r) => r._key !== key));
  }, []);

  // ── Save all dirty rows ─────────────────────────────────────────────────

  const handleSave = async () => {
    const dirtyRows = rows.filter((r) => r.dirty);
    if (dirtyRows.length === 0) return;

    // Validate required fields
    for (const r of dirtyRows) {
      if (
        !r.questionText.trim() ||
        !r.optionA.trim() ||
        !r.optionB.trim() ||
        !r.optionC.trim() ||
        !r.optionD.trim()
      ) {
        alert(`প্রশ্ন এবং সব অপশন পূরণ করুন। (Row ${r.sortOrder || "new"})`);
        return;
      }
    }

    setSaving(true);
    setSavedCount(null);
    try {
      const payload: BulkUpsertQuestionItem[] = dirtyRows.map((r) => ({
        ...(r.id ? { id: r.id } : {}),
        questionSetId: r.questionSetId,
        questionText: r.questionText.trim(),
        optionA: r.optionA.trim(),
        optionB: r.optionB.trim(),
        optionC: r.optionC.trim(),
        optionD: r.optionD.trim(),
        correctAnswer: r.correctAnswer,
        explanation: r.explanation.trim() || undefined,
        subject: r.subject.trim() || undefined,
        topic: r.topic.trim() || undefined,
        subTopic: r.subTopic.trim() || undefined,
        frequencyTag: r.frequencyTag.trim() || undefined,
        slug: r.slug.trim() || undefined,
        sortOrder: r.sortOrder,
      }));

      const saved = await questionSetService.bulkUpsertQuestions(payload);

      // Merge saved IDs back into rows
      const savedMap = new Map(saved.map((q, i) => [dirtyRows[i]!._key, q]));

      setRows((prev) =>
        prev.map((r) => {
          const s = savedMap.get(r._key);
          return s ? { ...r, id: s.id, dirty: false } : r;
        }),
      );

      setSavedCount(saved.length);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "সংরক্ষণ ব্যর্থ");
    } finally {
      setSaving(false);
    }
  };

  // ── Bulk delete selected rows ───────────────────────────────────────────

  const handleBulkDelete = async () => {
    const selected = rows.filter((r) => r.selected);
    if (selected.length === 0) return;

    const confirmMsg = `${selected.length} টি প্রশ্ন মুছে ফেলতে চান?`;
    if (!confirm(confirmMsg)) return;

    // Split into persisted (need API call) vs local-only (new, unsaved)
    const persistedIds = selected
      .filter((r) => r.id !== undefined)
      .map((r) => r.id as string);
    const localKeys = new Set(
      selected.filter((r) => r.id === undefined).map((r) => r._key),
    );

    setDeleting(true);
    try {
      if (persistedIds.length > 0) {
        await questionSetService.bulkDeleteQuestions(persistedIds);
      }
      // Remove from UI
      const deletedIdSet = new Set(persistedIds);
      setRows((prev) =>
        prev.filter(
          (r) => !localKeys.has(r._key) && !(r.id && deletedIdSet.has(r.id)),
        ),
      );
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "মুছে ফেলা ব্যর্থ");
    } finally {
      setDeleting(false);
    }
  };

  // ── Derived state ──────────────────────────────────────────────────────

  const dirtyCount = rows.filter((r) => r.dirty).length;
  const selectedCount = rows.filter((r) => r.selected).length;
  const allSelected = rows.length > 0 && rows.every((r) => r.selected);

  // ── Render ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/question-sets/${questionSetId}/questions`}>
            <ArrowLeft className="size-5" />
          </Link>
        </Button>

        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">
            বাল্ক প্রশ্ন ব্যবস্থাপনা
          </h1>
          {questionSet && (
            <p className="text-sm text-muted-foreground">
              {questionSet.title} — {rows.length} টি প্রশ্ন
              {dirtyCount > 0 && (
                <span className="ml-2 text-amber-600 font-medium">
                  ({dirtyCount} টি অপরিবর্তিত)
                </span>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="size-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="size-4 mr-1" />
              )}
              {selectedCount} টি মুছুন
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={addRow}>
            <Plus className="size-4 mr-1" />
            নতুন সারি
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || dirtyCount === 0}
          >
            {saving ? (
              <Loader2 className="size-4 mr-1 animate-spin" />
            ) : (
              <Save className="size-4 mr-1" />
            )}
            সংরক্ষণ করুন
            {dirtyCount > 0 && (
              <span className="ml-1 rounded-full bg-white/20 px-1.5 text-xs">
                {dirtyCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Success banner */}
      {savedCount !== null && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300">
          ✓ {savedCount} টি প্রশ্ন সফলভাবে সংরক্ষিত হয়েছে।
          <button
            className="ml-auto text-green-600 hover:text-green-800"
            onClick={() => setSavedCount(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/60 text-muted-foreground border-b border-border">
              <th className="px-3 py-2.5 text-left w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  aria-label="সব নির্বাচন করুন"
                  className="h-4 w-4 cursor-pointer accent-primary"
                />
              </th>
              <th className="px-2 py-2.5 text-center w-12">#</th>
              <th className="px-2 py-2.5 text-left min-w-[260px]">প্রশ্ন</th>
              <th className="px-2 py-2.5 text-left min-w-[130px]">ক) A</th>
              <th className="px-2 py-2.5 text-left min-w-[130px]">খ) B</th>
              <th className="px-2 py-2.5 text-left min-w-[130px]">গ) C</th>
              <th className="px-2 py-2.5 text-left min-w-[130px]">ঘ) D</th>
              <th className="px-2 py-2.5 text-center w-20">উত্তর</th>
              <th className="px-2 py-2.5 text-left min-w-[110px]">বিষয়</th>
              <th className="px-2 py-2.5 text-left min-w-[110px]">টপিক</th>
              <th className="px-2 py-2.5 text-center w-16">ব্যাখ্যা</th>
              <th className="px-2 py-2.5 w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={12}
                  className="py-12 text-center text-muted-foreground"
                >
                  কোনো প্রশ্ন নেই।{" "}
                  <button className="text-primary underline" onClick={addRow}>
                    প্রথম প্রশ্ন যোগ করুন
                  </button>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <RowGroup
                  key={row._key}
                  row={row}
                  onUpdate={updateRow}
                  onToggleExpand={toggleExpand}
                  onToggleSelect={toggleSelect}
                  onRemoveLocally={removeRowLocally}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom add button */}
      <div className="mt-4 flex justify-center">
        <Button variant="outline" size="sm" onClick={addRow}>
          <Plus className="size-4 mr-1" />
          নতুন সারি যোগ করুন
        </Button>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm border-2 border-dashed border-green-400 bg-green-50" />
          নতুন (অসংরক্ষিত)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm border-l-4 border-amber-400 bg-amber-50" />
          পরিবর্তিত (অসংরক্ষিত)
        </span>
      </div>
    </div>
  );
}

// ─── Row Group ──────────────────────────────────────────────────────────────

interface RowGroupProps {
  row: RowData;
  onUpdate: (key: string, patch: Partial<RowData>) => void;
  onToggleExpand: (key: string) => void;
  onToggleSelect: (key: string) => void;
  onRemoveLocally: (key: string) => void;
}

function RowGroup({
  row,
  onUpdate,
  onToggleExpand,
  onToggleSelect,
  onRemoveLocally,
}: RowGroupProps) {
  const isNew = row.id === undefined;

  const rowClass = isNew
    ? "border-l-4 border-dashed border-l-green-400 bg-green-50/40 dark:bg-green-900/10"
    : row.dirty
      ? "border-l-4 border-l-amber-400 bg-amber-50/30 dark:bg-amber-900/10"
      : "border-l-4 border-l-transparent";

  return (
    <>
      <tr
        className={`border-b border-border transition-colors hover:bg-muted/30 ${rowClass}`}
      >
        {/* Checkbox */}
        <td className="px-3 py-2">
          <input
            type="checkbox"
            checked={row.selected}
            onChange={() => onToggleSelect(row._key)}
            aria-label="নির্বাচন করুন"
            className="h-4 w-4 cursor-pointer accent-primary"
          />
        </td>

        {/* Sort order */}
        <td className="px-2 py-2 text-center">
          <Input
            type="number"
            min={0}
            value={row.sortOrder}
            onChange={(e) =>
              onUpdate(row._key, {
                sortOrder: parseInt(e.target.value) || 0,
              })
            }
            className="h-7 w-14 text-center text-xs p-1"
          />
        </td>

        {/* Question text */}
        <td className="px-2 py-2">
          <Textarea
            value={row.questionText}
            onChange={(e) =>
              onUpdate(row._key, { questionText: e.target.value })
            }
            rows={2}
            placeholder="প্রশ্নের বিষয়বস্তু..."
            className="min-w-[240px] text-xs resize-none"
          />
        </td>

        {/* Options A–D */}
        {(["optionA", "optionB", "optionC", "optionD"] as const).map(
          (field) => (
            <td key={field} className="px-2 py-2">
              <Input
                value={row[field]}
                onChange={(e) =>
                  onUpdate(row._key, { [field]: e.target.value })
                }
                placeholder="—"
                className="min-w-[120px] text-xs h-8"
              />
            </td>
          ),
        )}

        {/* Correct answer */}
        <td className="px-2 py-2 text-center">
          <Select
            value={row.correctAnswer}
            onValueChange={(v) => onUpdate(row._key, { correctAnswer: v })}
          >
            <SelectTrigger className="h-8 w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">ক</SelectItem>
              <SelectItem value="B">খ</SelectItem>
              <SelectItem value="C">গ</SelectItem>
              <SelectItem value="D">ঘ</SelectItem>
            </SelectContent>
          </Select>
        </td>

        {/* Subject */}
        <td className="px-2 py-2">
          <Input
            value={row.subject}
            onChange={(e) => onUpdate(row._key, { subject: e.target.value })}
            placeholder="বিষয়"
            className="min-w-[100px] text-xs h-8"
          />
        </td>

        {/* Topic */}
        <td className="px-2 py-2">
          <Input
            value={row.topic}
            onChange={(e) => onUpdate(row._key, { topic: e.target.value })}
            placeholder="টপিক"
            className="min-w-[100px] text-xs h-8"
          />
        </td>

        {/* Explanation toggle */}
        <td className="px-2 py-2 text-center">
          <button
            type="button"
            onClick={() => onToggleExpand(row._key)}
            className="inline-flex items-center gap-0.5 rounded px-1.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={row.expanded ? "লুকান" : "ব্যাখ্যা দেখুন"}
          >
            {row.explanation.trim() ? (
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-0.5" />
            ) : null}
            {row.expanded ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
          </button>
        </td>

        {/* Delete row */}
        <td className="px-2 py-2 text-center">
          <button
            type="button"
            onClick={() => {
              if (row.id) {
                onToggleSelect(row._key);
              } else {
                onRemoveLocally(row._key);
              }
            }}
            className="inline-flex size-7 items-center justify-center rounded text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors dark:hover:bg-red-900/20"
            title={row.id ? "নির্বাচন করুন" : "সারি সরান"}
          >
            <Trash2 className="size-3.5" />
          </button>
        </td>
      </tr>

      {/* Expanded explanation / extra fields */}
      {row.expanded && (
        <tr
          className={`border-b border-border ${isNew ? "bg-green-50/30 dark:bg-green-900/5" : row.dirty ? "bg-amber-50/20 dark:bg-amber-900/5" : "bg-muted/20"}`}
        >
          <td colSpan={12} className="px-4 pb-3 pt-1">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  ব্যাখ্যা
                </label>
                <Textarea
                  value={row.explanation}
                  onChange={(e) =>
                    onUpdate(row._key, { explanation: e.target.value })
                  }
                  rows={3}
                  placeholder="উত্তরের বিস্তারিত ব্যাখ্যা..."
                  className="text-xs resize-y"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  সাব-টপিক
                </label>
                <Input
                  value={row.subTopic}
                  onChange={(e) =>
                    onUpdate(row._key, { subTopic: e.target.value })
                  }
                  placeholder="সাব-টপিক"
                  className="text-xs h-8"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  ফ্রিকোয়েন্সি ট্যাগ
                </label>
                <Input
                  value={row.frequencyTag}
                  onChange={(e) =>
                    onUpdate(row._key, { frequencyTag: e.target.value })
                  }
                  placeholder="যেমন: বিগত ৫ বছর"
                  className="text-xs h-8"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  স্লাগ (slug)
                </label>
                <Input
                  value={row.slug}
                  onChange={(e) => onUpdate(row._key, { slug: e.target.value })}
                  placeholder="যেমন: বালক-পত্রিকা-প্রতিষ্ঠা"
                  className="text-xs h-8 font-mono"
                />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
