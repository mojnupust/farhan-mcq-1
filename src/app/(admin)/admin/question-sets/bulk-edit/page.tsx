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
import type { ExamCategory } from "@/features/exam-categories";
import { examCategoryService } from "@/features/exam-categories";
import type {
  BulkUpsertQuestionSetItem,
  QuestionSet,
} from "@/features/question-sets";
import { questionSetService } from "@/features/question-sets";
import type { SubExamCategory } from "@/features/sub-exam-categories";
import { subExamCategoryService } from "@/features/sub-exam-categories";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Row state ──────────────────────────────────────────────────────────────

interface RowData {
  _key: string;
  id: string | undefined;
  subExamCategoryId: string;
  title: string;
  date: string;
  totalMarks: number;
  duration: number;
  subject: string;
  topics: string;
  sourceMaterial: string;
  markPerQuestion: string;
  negativeMark: string;
  isFree: boolean;
  isLive: boolean;
  isActive: boolean;
  dirty: boolean;
  selected: boolean;
}

let _keyCounter = 0;
function nextKey() {
  return `row-${++_keyCounter}`;
}

function setToRow(s: QuestionSet, subExamCategoryId: string): RowData {
  return {
    _key: nextKey(),
    id: s.id,
    subExamCategoryId,
    title: s.title,
    date: s.date ? new Date(s.date).toISOString().split("T")[0]! : "",
    totalMarks: s.totalMarks,
    duration: s.duration,
    subject: s.subject ?? "",
    topics: s.topics ?? "",
    sourceMaterial: s.sourceMaterial ?? "",
    markPerQuestion:
      s.markPerQuestion !== null && s.markPerQuestion !== undefined
        ? String(s.markPerQuestion)
        : "",
    negativeMark:
      s.negativeMark !== null && s.negativeMark !== undefined
        ? String(s.negativeMark)
        : "",
    isFree: s.isFree,
    isLive: s.isLive,
    isActive: s.isActive,
    dirty: false,
    selected: false,
  };
}

function emptyRow(subExamCategoryId: string): RowData {
  return {
    _key: nextKey(),
    id: undefined,
    subExamCategoryId,
    title: "",
    date: new Date().toISOString().split("T")[0]!,
    totalMarks: 100,
    duration: 60,
    subject: "",
    topics: "",
    sourceMaterial: "",
    markPerQuestion: "",
    negativeMark: "",
    isFree: false,
    isLive: false,
    isActive: true,
    dirty: true,
    selected: false,
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function QuestionSetsBulkEditPage() {
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [subCategories, setSubCategories] = useState<SubExamCategory[]>([]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("");
  const [selectedSubCategorySlug, setSelectedSubCategorySlug] =
    useState<string>("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] =
    useState<string>("");

  const [rows, setRows] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  const loadingCats = useRef(true);

  // Load categories on mount
  useEffect(() => {
    examCategoryService
      .getAll()
      .then((cats) => {
        setCategories(cats);
        if (cats.length > 0) setSelectedCategorySlug(cats[0]!.slug);
      })
      .catch(console.error)
      .finally(() => {
        loadingCats.current = false;
      });
  }, []);

  // Load sub-categories when category changes
  useEffect(() => {
    if (!selectedCategorySlug) return;
    setSubCategories([]);
    setSelectedSubCategorySlug("");
    setSelectedSubCategoryId("");
    setRows([]);

    subExamCategoryService
      .getByCategorySlug(selectedCategorySlug)
      .then((subs) => {
        setSubCategories(subs);
        if (subs.length > 0) {
          setSelectedSubCategorySlug(subs[0]!.slug);
          setSelectedSubCategoryId(subs[0]!.id);
        }
      })
      .catch(console.error);
  }, [selectedCategorySlug]);

  // Load question sets when sub-category changes
  useEffect(() => {
    if (!selectedSubCategorySlug) return;
    setRows([]);
    setLoading(true);
    setSavedCount(null);

    questionSetService
      .getAllBySubCategorySlug(selectedSubCategorySlug)
      .then((sets) =>
        setRows(sets.map((s) => setToRow(s, selectedSubCategoryId))),
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedSubCategorySlug, selectedSubCategoryId]);

  const updateRow = useCallback((key: string, patch: Partial<RowData>) => {
    setRows((prev) =>
      prev.map((r) => (r._key === key ? { ...r, ...patch, dirty: true } : r)),
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
    if (!selectedSubCategoryId) return;
    setRows((prev) => [...prev, emptyRow(selectedSubCategoryId)]);
  }, [selectedSubCategoryId]);

  // ── Save dirty rows ────────────────────────────────────────────────────

  const handleSave = async () => {
    const dirtyRows = rows.filter((r) => r.dirty);
    if (dirtyRows.length === 0) return;

    for (const r of dirtyRows) {
      if (!r.title.trim()) {
        alert(`শিরোনাম পূরণ করুন।`);
        return;
      }
    }

    setSaving(true);
    setSavedCount(null);
    try {
      const payload: BulkUpsertQuestionSetItem[] = dirtyRows.map((r) => ({
        ...(r.id ? { id: r.id } : {}),
        subExamCategoryId: r.subExamCategoryId,
        title: r.title.trim(),
        date: r.date,
        totalMarks: r.totalMarks,
        duration: r.duration,
        subject: r.subject.trim(),
        topics: r.topics.trim() || undefined,
        sourceMaterial: r.sourceMaterial.trim() || undefined,
        markPerQuestion: r.markPerQuestion
          ? parseFloat(r.markPerQuestion)
          : undefined,
        negativeMark: r.negativeMark ? parseFloat(r.negativeMark) : undefined,
        isFree: r.isFree,
        isLive: r.isLive,
        isActive: r.isActive,
      }));

      const saved = await questionSetService.bulkUpsertSets(payload);

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
    if (!confirm(`${selected.length} টি প্রশ্নসেট মুছে ফেলতে চান?`)) return;

    const persistedIds = selected
      .filter((r) => r.id !== undefined)
      .map((r) => r.id as string);
    const localKeys = new Set(
      selected.filter((r) => r.id === undefined).map((r) => r._key),
    );

    setDeleting(true);
    try {
      if (persistedIds.length > 0) {
        await questionSetService.bulkDeleteSets(persistedIds);
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

  const dirtyCount = rows.filter((r) => r.dirty).length;
  const selectedCount = rows.filter((r) => r.selected).length;
  const allSelected = rows.length > 0 && rows.every((r) => r.selected);

  return (
    <div className="mx-auto max-w-400 px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/question-sets">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>

        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">
            বাল্ক প্রশ্নসেট ব্যবস্থাপনা
          </h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} টি প্রশ্নসেট
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
            disabled={!selectedSubCategoryId}
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

      {/* Category / Sub-category selector */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="w-56">
          <Select
            value={selectedCategorySlug}
            onValueChange={setSelectedCategorySlug}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="ক্যাটাগরি বাছুন" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-56">
          <Select
            value={selectedSubCategorySlug}
            onValueChange={(slug) => {
              const sub = subCategories.find((s) => s.slug === slug);
              setSelectedSubCategorySlug(slug);
              setSelectedSubCategoryId(sub?.id ?? "");
            }}
            disabled={subCategories.length === 0}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="সাব-ক্যাটাগরি বাছুন" />
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
      </div>

      {savedCount !== null && (
        <div className="mb-4 rounded-md bg-green-50 px-4 py-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
          ✓ {savedCount} টি প্রশ্নসেট সফলভাবে সংরক্ষিত হয়েছে
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-7 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="w-10 px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer accent-primary"
                    checked={allSelected}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="min-w-44 px-3 py-2 text-left font-medium">
                  শিরোনাম
                </th>
                <th className="min-w-32 px-3 py-2 text-left font-medium">
                  তারিখ
                </th>
                <th className="min-w-25 px-3 py-2 text-left font-medium">
                  মোট নম্বর
                </th>
                <th className="min-w-25 px-3 py-2 text-left font-medium">
                  সময় (মিনিট)
                </th>
                <th className="min-w-32 px-3 py-2 text-left font-medium">
                  বিষয়
                </th>
                <th className="min-w-25 px-3 py-2 text-left font-medium">
                  প্রতি প্রশ্ন নম্বর
                </th>
                <th className="min-w-25 px-3 py-2 text-left font-medium">
                  নেগেটিভ মার্ক
                </th>
                <th className="w-16 px-3 py-2 text-center font-medium">ফ্রি</th>
                <th className="w-16 px-3 py-2 text-center font-medium">লাইভ</th>
                <th className="w-20 px-3 py-2 text-center font-medium">
                  সক্রিয়
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr
                  key={row._key}
                  className={
                    row.dirty ? "bg-amber-50/40 dark:bg-amber-900/10" : ""
                  }
                >
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer accent-primary"
                      checked={row.selected}
                      onChange={() => toggleSelect(row._key)}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input
                      value={row.title}
                      onChange={(e) =>
                        updateRow(row._key, { title: e.target.value })
                      }
                      placeholder="প্রশ্নসেটের শিরোনাম"
                      className="min-w-40 h-8 text-sm"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input
                      type="date"
                      value={row.date}
                      onChange={(e) =>
                        updateRow(row._key, { date: e.target.value })
                      }
                      className="min-w-32 h-8 text-sm"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input
                      type="number"
                      value={row.totalMarks}
                      onChange={(e) =>
                        updateRow(row._key, {
                          totalMarks: parseInt(e.target.value) || 0,
                        })
                      }
                      min={0}
                      className="min-w-20 h-8 text-sm"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input
                      type="number"
                      value={row.duration}
                      onChange={(e) =>
                        updateRow(row._key, {
                          duration: parseInt(e.target.value) || 0,
                        })
                      }
                      min={1}
                      className="min-w-20 h-8 text-sm"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input
                      value={row.subject}
                      onChange={(e) =>
                        updateRow(row._key, { subject: e.target.value })
                      }
                      placeholder="বিষয়ের নাম"
                      className="min-w-28 h-8 text-sm"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input
                      type="number"
                      value={row.markPerQuestion}
                      onChange={(e) =>
                        updateRow(row._key, { markPerQuestion: e.target.value })
                      }
                      placeholder="—"
                      step="0.01"
                      min={0}
                      className="min-w-20 h-8 text-sm"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input
                      type="number"
                      value={row.negativeMark}
                      onChange={(e) =>
                        updateRow(row._key, { negativeMark: e.target.value })
                      }
                      placeholder="—"
                      step="0.01"
                      min={0}
                      className="min-w-20 h-8 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer accent-primary"
                      checked={row.isFree}
                      onChange={(e) =>
                        updateRow(row._key, { isFree: e.target.checked })
                      }
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer accent-primary"
                      checked={row.isLive}
                      onChange={(e) =>
                        updateRow(row._key, { isLive: e.target.checked })
                      }
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer accent-primary"
                      checked={row.isActive}
                      onChange={(e) =>
                        updateRow(row._key, { isActive: e.target.checked })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {rows.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {selectedSubCategorySlug
                ? "কোনো প্রশ্নসেট নেই। নতুন সারি যোগ করুন।"
                : "সাব-ক্যাটাগরি বাছুন।"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
