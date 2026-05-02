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
import type { ExamCategory } from "@/features/exam-categories";
import { examCategoryService } from "@/features/exam-categories";
import type { BulkUpsertRoutineItem, Routine } from "@/features/routines";
import { routineService } from "@/features/routines";
import type { SubExamCategory } from "@/features/sub-exam-categories";
import { subExamCategoryService } from "@/features/sub-exam-categories";
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
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Row state ──────────────────────────────────────────────────────────────

interface RowData {
  _key: string;
  id: string | undefined;
  subExamCategoryId: string;
  date: string;
  title: string;
  totalMarks: number;
  duration: number;
  subject: string;
  topics: string;
  sourceMaterial: string;
  description: string;
  isActive: boolean;
  dirty: boolean;
  expanded: boolean;
  selected: boolean;
}

let _keyCounter = 0;
function nextKey() {
  return `row-${++_keyCounter}`;
}

function routineToRow(r: Routine): RowData {
  return {
    _key: nextKey(),
    id: r.id,
    subExamCategoryId: r.subExamCategoryId,
    date: r.date.split("T")[0]!,
    title: r.title,
    totalMarks: r.totalMarks,
    duration: r.duration,
    subject: r.subject,
    topics: r.topics ?? "",
    sourceMaterial: r.sourceMaterial ?? "",
    description: r.description ?? "",
    isActive: r.isActive,
    dirty: false,
    expanded: false,
    selected: false,
  };
}

function emptyRow(subExamCategoryId: string): RowData {
  return {
    _key: nextKey(),
    id: undefined,
    subExamCategoryId,
    date: new Date().toISOString().split("T")[0]!,
    title: "",
    totalMarks: 50,
    duration: 10,
    subject: "",
    topics: "",
    sourceMaterial: "",
    description: "",
    isActive: true,
    dirty: true,
    expanded: false,
    selected: false,
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RoutinesBulkEditPage() {
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [selectedCatId, setSelectedCatId] = useState("");
  const [subCategories, setSubCategories] = useState<SubExamCategory[]>([]);
  const [selectedSubSlug, setSelectedSubSlug] = useState("");
  const [selectedSubId, setSelectedSubId] = useState("");

  const [rows, setRows] = useState<RowData[]>([]);
  const [loadingRoutines, setLoadingRoutines] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  const originalIds = useRef<Set<string>>(new Set());

  // ── Load categories ────────────────────────────────────────────────────

  useEffect(() => {
    examCategoryService
      .getAll()
      .then((cats) => {
        setCategories(cats);
        if (cats.length > 0) setSelectedCatId(cats[0]!.id);
      })
      .catch(console.error);
  }, []);

  // ── Load sub-categories when category changes ──────────────────────────

  useEffect(() => {
    if (!selectedCatId) return;
    const cat = categories.find((c) => c.id === selectedCatId);
    if (!cat) return;
    subExamCategoryService
      .getByCategorySlug(cat.slug)
      .then((subs) => {
        setSubCategories(subs);
        if (subs.length > 0) {
          setSelectedSubSlug(subs[0]!.slug);
          setSelectedSubId(subs[0]!.id);
        } else {
          setSelectedSubSlug("");
          setSelectedSubId("");
        }
      })
      .catch(console.error);
  }, [selectedCatId, categories]);

  // ── Load routines when sub-category changes ────────────────────────────

  useEffect(() => {
    if (!selectedSubSlug) {
      setRows([]);
      return;
    }
    setLoadingRoutines(true);
    routineService
      .getBySubCategorySlug(selectedSubSlug)
      .then((routines) => {
        setRows(routines.map(routineToRow));
        originalIds.current = new Set(routines.map((r) => r.id));
        setSavedCount(null);
      })
      .catch(console.error)
      .finally(() => setLoadingRoutines(false));
  }, [selectedSubSlug]);

  // ── Helpers ────────────────────────────────────────────────────────────

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
    setRows((prev) => [...prev, emptyRow(selectedSubId)]);
  }, [selectedSubId]);

  const removeRowLocally = useCallback((key: string) => {
    setRows((prev) => prev.filter((r) => r._key !== key));
  }, []);

  // ── Save dirty rows ────────────────────────────────────────────────────

  const handleSave = async () => {
    const dirtyRows = rows.filter((r) => r.dirty);
    if (dirtyRows.length === 0) return;

    for (const r of dirtyRows) {
      if (!r.title.trim() || !r.subject.trim() || !r.date) {
        alert(`তারিখ, শিরোনাম ও বিষয় পূরণ করুন। (Row: ${r.title || "নতুন"})`);
        return;
      }
    }

    setSaving(true);
    setSavedCount(null);
    try {
      const payload: BulkUpsertRoutineItem[] = dirtyRows.map((r) => ({
        ...(r.id ? { id: r.id } : {}),
        subExamCategoryId: r.subExamCategoryId || selectedSubId,
        date: r.date,
        title: r.title.trim(),
        totalMarks: r.totalMarks,
        duration: r.duration,
        subject: r.subject.trim(),
        topics: r.topics.trim() || undefined,
        sourceMaterial: r.sourceMaterial.trim() || undefined,
        description: r.description.trim() || undefined,
        isActive: r.isActive,
      }));

      const saved = await routineService.bulkUpsert(payload);

      const savedMap = new Map(saved.map((s, i) => [dirtyRows[i]!._key, s]));
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

  // ── Bulk delete ────────────────────────────────────────────────────────

  const handleBulkDelete = async () => {
    const selected = rows.filter((r) => r.selected);
    if (selected.length === 0) return;
    if (!confirm(`${selected.length} টি রুটিন মুছে ফেলতে চান?`)) return;

    const persistedIds = selected
      .filter((r) => r.id !== undefined)
      .map((r) => r.id as string);
    const localKeys = new Set(
      selected.filter((r) => r.id === undefined).map((r) => r._key),
    );

    setDeleting(true);
    try {
      if (persistedIds.length > 0) {
        await routineService.bulkDelete(persistedIds);
      }
      const deletedSet = new Set(persistedIds);
      setRows((prev) =>
        prev.filter(
          (r) => !localKeys.has(r._key) && !(r.id && deletedSet.has(r.id)),
        ),
      );
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "মুছে ফেলা ব্যর্থ");
    } finally {
      setDeleting(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────

  const dirtyCount = rows.filter((r) => r.dirty).length;
  const selectedCount = rows.filter((r) => r.selected).length;
  const allSelected = rows.length > 0 && rows.every((r) => r.selected);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-400 px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/routines">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>

        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">
            বাল্ক রুটিন ব্যবস্থাপনা
          </h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} টি রুটিন
            {dirtyCount > 0 && (
              <span className="ml-2 font-medium text-amber-600">
                ({dirtyCount} টি পরিবর্তিত)
              </span>
            )}
          </p>
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
          <Button
            variant="outline"
            size="sm"
            onClick={addRow}
            disabled={!selectedSubId}
          >
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

      {/* Category filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={selectedCatId} onValueChange={setSelectedCatId}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="পরীক্ষার ক্যাটাগরি" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedSubSlug}
          onValueChange={(slug) => {
            setSelectedSubSlug(slug);
            const sub = subCategories.find((s) => s.slug === slug);
            setSelectedSubId(sub?.id ?? "");
          }}
          disabled={subCategories.length === 0}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="সাব-ক্যাটাগরি" />
          </SelectTrigger>
          <SelectContent>
            {subCategories.map((s) => (
              <SelectItem key={s.id} value={s.slug}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Success banner */}
      {savedCount !== null && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300">
          ✓ {savedCount} টি রুটিন সফলভাবে সংরক্ষিত হয়েছে।
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
              <th className="min-w-40 px-2 py-2.5 text-left">তারিখ</th>
              <th className="min-w-65 px-2 py-2.5 text-left">শিরোনাম</th>
              <th className="min-w-40 px-2 py-2.5 text-left">বিষয়</th>
              <th className="w-20 px-2 py-2.5 text-center">মার্ক</th>
              <th className="w-20 px-2 py-2.5 text-center">সময় (মি.)</th>
              <th className="w-20 px-2 py-2.5 text-center">সক্রিয়</th>
              <th className="w-16 px-2 py-2.5 text-center">বিস্তারিত</th>
              <th className="w-10 px-2 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {loadingRoutines ? (
              <tr>
                <td colSpan={9} className="py-10 text-center">
                  <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="py-12 text-center text-muted-foreground"
                >
                  {selectedSubSlug
                    ? "কোনো রুটিন নেই। "
                    : "সাব-ক্যাটাগরি নির্বাচন করুন। "}
                  {selectedSubId && (
                    <button className="text-primary underline" onClick={addRow}>
                      প্রথম রুটিন যোগ করুন
                    </button>
                  )}
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

      {/* Bottom add */}
      {selectedSubId && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" size="sm" onClick={addRow}>
            <Plus className="size-4 mr-1" />
            নতুন সারি যোগ করুন
          </Button>
        </div>
      )}

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

// ─── Row Group ───────────────────────────────────────────────────────────────

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

        {/* Date */}
        <td className="px-2 py-2">
          <Input
            type="date"
            value={row.date}
            onChange={(e) => onUpdate(row._key, { date: e.target.value })}
            className="h-8 text-xs"
          />
        </td>

        {/* Title */}
        <td className="px-2 py-2">
          <Textarea
            value={row.title}
            onChange={(e) => onUpdate(row._key, { title: e.target.value })}
            rows={2}
            placeholder="রুটিনের শিরোনাম..."
            className="min-w-60 resize-none text-xs"
          />
        </td>

        {/* Subject */}
        <td className="px-2 py-2">
          <Input
            value={row.subject}
            onChange={(e) => onUpdate(row._key, { subject: e.target.value })}
            placeholder="বিষয়"
            className="min-w-32 h-8 text-xs"
          />
        </td>

        {/* Total marks */}
        <td className="px-2 py-2">
          <Input
            type="number"
            min={1}
            value={row.totalMarks}
            onChange={(e) =>
              onUpdate(row._key, {
                totalMarks: parseInt(e.target.value) || 1,
              })
            }
            className="h-8 w-16 text-center text-xs"
          />
        </td>

        {/* Duration */}
        <td className="px-2 py-2">
          <Input
            type="number"
            min={1}
            value={row.duration}
            onChange={(e) =>
              onUpdate(row._key, { duration: parseInt(e.target.value) || 1 })
            }
            className="h-8 w-16 text-center text-xs"
          />
        </td>

        {/* isActive */}
        <td className="px-2 py-2 text-center">
          <input
            type="checkbox"
            checked={row.isActive}
            onChange={(e) => onUpdate(row._key, { isActive: e.target.checked })}
            aria-label="সক্রিয়"
            className="h-4 w-4 cursor-pointer accent-primary"
          />
        </td>

        {/* Expand toggle */}
        <td className="px-2 py-2 text-center">
          <button
            type="button"
            onClick={() => onToggleExpand(row._key)}
            className="inline-flex items-center gap-0.5 rounded px-1.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title={row.expanded ? "লুকান" : "বিস্তারিত দেখুন"}
          >
            {(row.topics || row.sourceMaterial || row.description) && (
              <span className="mr-0.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
            )}
            {row.expanded ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
          </button>
        </td>

        {/* Delete */}
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
            className="inline-flex size-7 items-center justify-center rounded text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
            title={row.id ? "নির্বাচন করুন" : "সারি সরান"}
          >
            <Trash2 className="size-3.5" />
          </button>
        </td>
      </tr>

      {/* Expanded row — topics, sourceMaterial, description */}
      {row.expanded && (
        <tr
          className={`border-b border-border ${
            isNew
              ? "bg-green-50/30 dark:bg-green-900/5"
              : row.dirty
                ? "bg-amber-50/20 dark:bg-amber-900/5"
                : "bg-muted/20"
          }`}
        >
          <td colSpan={9} className="px-4 pb-3 pt-1">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  টপিক / বিষয়বস্তু
                </label>
                <Input
                  value={row.topics}
                  onChange={(e) =>
                    onUpdate(row._key, { topics: e.target.value })
                  }
                  placeholder="যেমন: কবিতা, গল্প, উপন্যাস"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  উৎস উপকরণ
                </label>
                <Input
                  value={row.sourceMaterial}
                  onChange={(e) =>
                    onUpdate(row._key, { sourceMaterial: e.target.value })
                  }
                  placeholder="যেমন: NCTB বোর্ড বই"
                  className="h-8 text-xs"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  বিবরণ
                </label>
                <Textarea
                  value={row.description}
                  onChange={(e) =>
                    onUpdate(row._key, { description: e.target.value })
                  }
                  rows={2}
                  placeholder="রুটিনের বিবরণ..."
                  className="resize-y text-xs"
                />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
