"use client";

import {
  RowClassificationSelects,
  SharedExamSelect,
} from "@/components/admin/exam-subject-topic-selects";
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
  getExamNameForSubject,
  getSubjectsByExamName,
  getTopicsBySubjectName,
  type SubjectOption,
} from "@/lib/data/exam-subject-topics";
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
import {
  memo,
  startTransition,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ─── Row state ─────────────────────────────────────────────────────────────

interface RowData {
  _key: string;
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
  dirty: boolean;
  expanded: boolean;
  selected: boolean;
}

let _keyCounter = 0;
function nextKey() {
  return `row-${++_keyCounter}`;
}

function inferSharedExamName(questions: Question[]): string {
  for (const q of questions) {
    const exam = getExamNameForSubject(q.subject ?? "");
    if (exam) return exam;
  }
  return "";
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

function patchRowForExamChange(
  row: RowData,
  nextExam: string,
): RowData {
  if (!nextExam) {
    if (!row.subject && !row.topic) return row;
    return { ...row, subject: "", topic: "", dirty: true };
  }
  const validSubjects = getSubjectsByExamName(nextExam);
  const subjectOk =
    row.subject && validSubjects.some((s) => s.name === row.subject);
  if (!subjectOk) {
    if (!row.subject && !row.topic) return row;
    return { ...row, subject: "", topic: "", dirty: true };
  }
  if (row.topic) {
    const topics = getTopicsBySubjectName(row.subject);
    if (!topics.some((t) => t.name === row.topic)) {
      return { ...row, topic: "", dirty: true };
    }
  }
  return row;
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function BulkEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: questionSetId } = use(params);

  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [rows, setRows] = useState<RowData[]>([]);
  const [sharedExamName, setSharedExamName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  const originalIds = useRef<Set<string>>(new Set());

  const subjectOptions = useMemo(
    () => (sharedExamName ? getSubjectsByExamName(sharedExamName) : []),
    [sharedExamName],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [qs, questions] = await Promise.all([
          questionSetService.getById(questionSetId),
          questionSetService.getQuestions(questionSetId),
        ]);
        if (cancelled) return;

        setQuestionSet(qs);
        setRows(questions.map((q) => questionToRow(q, questionSetId)));
        setSharedExamName(inferSharedExamName(questions));
        originalIds.current = new Set(questions.map((q) => q.id));
      } catch (err) {
        if (!cancelled) console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [questionSetId]);

  const updateRow = useCallback((key: string, patch: Partial<RowData>) => {
    setRows((prev) => {
      const i = prev.findIndex((r) => r._key === key);
      if (i === -1) return prev;
      const current = prev[i]!;
      const next = [...prev];
      next[i] = { ...current, ...patch, dirty: true };
      return next;
    });
  }, []);

  /** One exam for the whole set — updates every row (clears invalid subject/topic). */
  const handleSharedExamChange = useCallback((nextExam: string) => {
    setSharedExamName(nextExam);
    startTransition(() => {
      setRows((prev) => {
        let changed = false;
        const next = prev.map((r) => {
          const patched = patchRowForExamChange(r, nextExam);
          if (patched !== r) changed = true;
          return patched;
        });
        return changed ? next : prev;
      });
    });
  }, []);

  const updateRowClassification = useCallback(
    (key: string, patch: { subject?: string; topic?: string }) => {
      updateRow(key, patch);
    },
    [updateRow],
  );

  const toggleExpand = useCallback((key: string) => {
    setRows((prev) => {
      const i = prev.findIndex((r) => r._key === key);
      if (i === -1) return prev;
      const current = prev[i]!;
      const next = [...prev];
      next[i] = { ...current, expanded: !current.expanded };
      return next;
    });
  }, []);

  const toggleSelect = useCallback((key: string) => {
    setRows((prev) => {
      const i = prev.findIndex((r) => r._key === key);
      if (i === -1) return prev;
      const current = prev[i]!;
      const next = [...prev];
      next[i] = { ...current, selected: !current.selected };
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((checked: boolean) => {
    setRows((prev) => {
      if (prev.every((r) => r.selected === checked)) return prev;
      return prev.map((r) => ({ ...r, selected: checked }));
    });
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, emptyRow(questionSetId, prev.length + 1)]);
  }, [questionSetId]);

  const removeRowLocally = useCallback((key: string) => {
    setRows((prev) => prev.filter((r) => r._key !== key));
  }, []);

  const handleSave = async () => {
    const dirtyRows = rows.filter((r) => r.dirty);
    if (dirtyRows.length === 0) return;

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
      const savedMap = new Map(saved.map((q, i) => [dirtyRows[i]!._key, q]));

      setRows((prev) => {
        const next = [...prev];
        for (let i = 0; i < next.length; i += 1) {
          const s = savedMap.get(next[i]!._key);
          if (s) next[i] = { ...next[i]!, id: s.id, dirty: false };
        }
        return next;
      });

      setSavedCount(saved.length);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "সংরক্ষণ ব্যর্থ");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    const selected = rows.filter((r) => r.selected);
    if (selected.length === 0) return;

    if (!confirm(`${selected.length} টি প্রশ্ন মুছে ফেলতে চান?`)) return;

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

  const { dirtyCount, selectedCount, allSelected } = useMemo(() => {
    let dirty = 0;
    let selected = 0;
    for (const r of rows) {
      if (r.dirty) dirty += 1;
      if (r.selected) selected += 1;
    }
    return {
      dirtyCount: dirty,
      selectedCount: selected,
      allSelected: rows.length > 0 && selected === rows.length,
    };
  }, [rows]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-400 px-4 py-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/question-sets/${questionSetId}/questions`}>
            <ArrowLeft className="size-5" />
          </Link>
        </Button>

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">
            বাল্ক প্রশ্ন ব্যবস্থাপনা
          </h1>
          {questionSet && (
            <p className="text-sm text-muted-foreground">
              {questionSet.title} — {rows.length} টি প্রশ্ন
              {dirtyCount > 0 && (
                <span className="ml-2 font-medium text-amber-600">
                  ({dirtyCount} টি অসংরক্ষিত)
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
                <Loader2 className="mr-1 size-4 animate-spin" />
              ) : (
                <Trash2 className="mr-1 size-4" />
              )}
              {selectedCount} টি মুছুন
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={addRow}>
            <Plus className="mr-1 size-4" />
            নতুন সারি
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || dirtyCount === 0}
          >
            {saving ? (
              <Loader2 className="mr-1 size-4 animate-spin" />
            ) : (
              <Save className="mr-1 size-4" />
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

      {/* Shared exam — applies to all rows */}
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            সকল প্রশ্নের পরীক্ষা — এখানে বা যেকোনো সারিতে পরিবর্তন করলে সব সারিতে
            একই পরীক্ষা সেট হবে
          </p>
          <SharedExamSelect
            examName={sharedExamName}
            onExamChange={handleSharedExamChange}
          />
        </div>
        {!sharedExamName && (
          <p className="pb-1 text-xs text-amber-700 dark:text-amber-400">
            প্রথমে পরীক্ষা নির্বাচন করুন, তারপর প্রতিটি সারিতে বিষয় ও টপিক।
          </p>
        )}
      </div>

      {savedCount !== null && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300">
          ✓ {savedCount} টি প্রশ্ন সফলভাবে সংরক্ষিত হয়েছে।
          <button
            type="button"
            className="ml-auto text-green-600 hover:text-green-800"
            onClick={() => setSavedCount(null)}
          >
            ✕
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/60 text-muted-foreground">
              <th className="w-10 px-3 py-2.5 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  aria-label="সব নির্বাচন করুন"
                  className="h-4 w-4 cursor-pointer accent-primary"
                />
              </th>
              <th className="w-12 px-2 py-2.5 text-center">#</th>
              <th className="min-w-65 px-2 py-2.5 text-left">প্রশ্ন</th>
              <th className="min-w-32.5 px-2 py-2.5 text-left">ক) A</th>
              <th className="min-w-32.5 px-2 py-2.5 text-left">খ) B</th>
              <th className="min-w-32.5 px-2 py-2.5 text-left">গ) C</th>
              <th className="min-w-32.5 px-2 py-2.5 text-left">ঘ) D</th>
              <th className="w-20 px-2 py-2.5 text-center">উত্তর</th>
              <th className="min-w-45 px-2 py-2.5 text-left">
                পরীক্ষা / বিষয় / টপিক
              </th>
              <th className="w-16 px-2 py-2.5 text-center">ব্যাখ্যা</th>
              <th className="w-10 px-2 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="py-12 text-center text-muted-foreground"
                >
                  কোনো প্রশ্ন নেই।{" "}
                  <button
                    type="button"
                    className="text-primary underline"
                    onClick={addRow}
                  >
                    প্রথম প্রশ্ন যোগ করুন
                  </button>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <RowGroup
                  key={row._key}
                  row={row}
                  sharedExamName={sharedExamName}
                  subjectOptions={subjectOptions}
                  onSharedExamChange={handleSharedExamChange}
                  onUpdate={updateRow}
                  onUpdateClassification={updateRowClassification}
                  onToggleExpand={toggleExpand}
                  onToggleSelect={toggleSelect}
                  onRemoveLocally={removeRowLocally}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-center">
        <Button variant="outline" size="sm" onClick={addRow}>
          <Plus className="mr-1 size-4" />
          নতুন সারি যোগ করুন
        </Button>
      </div>

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

// ─── Row (memo: re-render only when this row or shared subject list changes) ─

interface RowGroupProps {
  row: RowData;
  sharedExamName: string;
  subjectOptions: SubjectOption[];
  onSharedExamChange: (examName: string) => void;
  onUpdate: (key: string, patch: Partial<RowData>) => void;
  onUpdateClassification: (
    key: string,
    patch: { subject?: string; topic?: string },
  ) => void;
  onToggleExpand: (key: string) => void;
  onToggleSelect: (key: string) => void;
  onRemoveLocally: (key: string) => void;
}

function rowGroupPropsAreEqual(prev: RowGroupProps, next: RowGroupProps): boolean {
  return (
    prev.row === next.row &&
    prev.sharedExamName === next.sharedExamName &&
    prev.subjectOptions === next.subjectOptions
  );
}

const RowGroup = memo(function RowGroup({
  row,
  sharedExamName,
  subjectOptions,
  onSharedExamChange,
  onUpdate,
  onUpdateClassification,
  onToggleExpand,
  onToggleSelect,
  onRemoveLocally,
}: RowGroupProps) {
  const rowKey = row._key;
  const isNew = row.id === undefined;

  const rowClass = isNew
    ? "border-l-4 border-dashed border-l-green-400 bg-green-50/40 dark:bg-green-900/10"
    : row.dirty
      ? "border-l-4 border-l-amber-400 bg-amber-50/30 dark:bg-amber-900/10"
      : "border-l-4 border-l-transparent";

  const handleClassificationChange = useCallback(
    (patch: { subject?: string; topic?: string }) => {
      onUpdateClassification(rowKey, patch);
    },
    [rowKey, onUpdateClassification],
  );

  return (
    <>
      <tr
        className={`border-b border-border hover:bg-muted/30 ${rowClass}`}
      >
        <td className="px-3 py-2">
          <input
            type="checkbox"
            checked={row.selected}
            onChange={() => onToggleSelect(rowKey)}
            aria-label="নির্বাচন করুন"
            className="h-4 w-4 cursor-pointer accent-primary"
          />
        </td>

        <td className="px-2 py-2 text-center">
          <Input
            type="number"
            min={0}
            value={row.sortOrder}
            onChange={(e) =>
              onUpdate(rowKey, {
                sortOrder: parseInt(e.target.value, 10) || 0,
              })
            }
            className="h-7 w-14 p-1 text-center text-xs"
          />
        </td>

        <td className="px-2 py-2">
          <Textarea
            value={row.questionText}
            onChange={(e) =>
              onUpdate(rowKey, { questionText: e.target.value })
            }
            rows={2}
            placeholder="প্রশ্নের বিষয়বস্তু..."
            className="min-w-60 resize-none text-xs"
          />
        </td>

        {(["optionA", "optionB", "optionC", "optionD"] as const).map(
          (field) => (
            <td key={field} className="px-2 py-2">
              <Input
                value={row[field]}
                onChange={(e) =>
                  onUpdate(rowKey, { [field]: e.target.value })
                }
                placeholder="—"
                className="h-8 min-w-30 text-xs"
              />
            </td>
          ),
        )}

        <td className="px-2 py-2 text-center">
          <Select
            value={row.correctAnswer}
            onValueChange={(v) => onUpdate(rowKey, { correctAnswer: v })}
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

        <td className="px-2 py-2 align-top">
          <RowClassificationSelects
            examName={sharedExamName}
            subject={row.subject}
            topic={row.topic}
            subjectOptions={subjectOptions}
            onExamChange={onSharedExamChange}
            onSubjectTopicChange={handleClassificationChange}
          />
        </td>

        <td className="px-2 py-2 text-center">
          <button
            type="button"
            onClick={() => onToggleExpand(rowKey)}
            className="inline-flex items-center gap-0.5 rounded px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title={row.expanded ? "লুকান" : "ব্যাখ্যা দেখুন"}
          >
            {row.explanation.trim() ? (
              <span className="mr-0.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
            ) : null}
            {row.expanded ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
          </button>
        </td>

        <td className="px-2 py-2 text-center">
          <button
            type="button"
            onClick={() => {
              if (row.id) onToggleSelect(rowKey);
              else onRemoveLocally(rowKey);
            }}
            className="inline-flex size-7 items-center justify-center rounded text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
            title={row.id ? "নির্বাচন করুন" : "সারি সরান"}
          >
            <Trash2 className="size-3.5" />
          </button>
        </td>
      </tr>

      {row.expanded && (
        <tr
          className={`border-b border-border ${isNew ? "bg-green-50/30 dark:bg-green-900/5" : row.dirty ? "bg-amber-50/20 dark:bg-amber-900/5" : "bg-muted/20"}`}
        >
          <td colSpan={11} className="px-4 pb-3 pt-1">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  ব্যাখ্যা
                </label>
                <Textarea
                  value={row.explanation}
                  onChange={(e) =>
                    onUpdate(rowKey, { explanation: e.target.value })
                  }
                  rows={3}
                  placeholder="উত্তরের বিস্তারিত ব্যাখ্যা..."
                  className="resize-y text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  সাব-টপিক
                </label>
                <Input
                  value={row.subTopic}
                  onChange={(e) =>
                    onUpdate(rowKey, { subTopic: e.target.value })
                  }
                  placeholder="সাব-টপিক"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  ফ্রিকোয়েন্সি ট্যাগ
                </label>
                <Input
                  value={row.frequencyTag}
                  onChange={(e) =>
                    onUpdate(rowKey, { frequencyTag: e.target.value })
                  }
                  placeholder="যেমন: বিগত ৫ বছর"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  স্লাগ (slug)
                </label>
                <Input
                  value={row.slug}
                  onChange={(e) => onUpdate(rowKey, { slug: e.target.value })}
                  placeholder="যেমন: বালক-পত্রিকা-প্রতিষ্ঠা"
                  className="h-8 font-mono text-xs"
                />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}, rowGroupPropsAreEqual);
