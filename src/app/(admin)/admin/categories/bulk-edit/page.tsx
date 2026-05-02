"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  BulkUpsertExamCategoryItem,
  ExamCategory,
} from "@/features/exam-categories";
import { examCategoryService } from "@/features/exam-categories";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Row state ──────────────────────────────────────────────────────────────

interface RowData {
  _key: string;
  id: string | undefined;
  name: string;
  slug: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  dirty: boolean;
  selected: boolean;
}

let _keyCounter = 0;
function nextKey() {
  return `row-${++_keyCounter}`;
}

function categoryToRow(c: ExamCategory): RowData {
  return {
    _key: nextKey(),
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon ?? "",
    sortOrder: c.sortOrder,
    isActive: c.isActive,
    dirty: false,
    selected: false,
  };
}

function emptyRow(): RowData {
  return {
    _key: nextKey(),
    id: undefined,
    name: "",
    slug: "",
    icon: "",
    sortOrder: 0,
    isActive: true,
    dirty: true,
    selected: false,
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CategoriesBulkEditPage() {
  const [rows, setRows] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  const originalIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    examCategoryService
      .getAll()
      .then((cats) => {
        setRows(cats.map(categoryToRow));
        originalIds.current = new Set(cats.map((c) => c.id));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
    setRows((prev) => [...prev, emptyRow()]);
  }, []);

  // ── Save dirty rows ────────────────────────────────────────────────────

  const handleSave = async () => {
    const dirtyRows = rows.filter((r) => r.dirty);
    if (dirtyRows.length === 0) return;

    for (const r of dirtyRows) {
      if (!r.name.trim() || !r.slug.trim()) {
        alert(`নাম ও স্লাগ পূরণ করুন। (Row: ${r.name || "নতুন"})`);
        return;
      }
    }

    setSaving(true);
    setSavedCount(null);
    try {
      const payload: BulkUpsertExamCategoryItem[] = dirtyRows.map((r) => ({
        ...(r.id ? { id: r.id } : {}),
        name: r.name.trim(),
        slug: r.slug.trim(),
        icon: r.icon.trim() || undefined,
        sortOrder: r.sortOrder,
        isActive: r.isActive,
      }));

      const saved = await examCategoryService.bulkUpsert(payload);

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
    if (!confirm(`${selected.length} টি ক্যাটাগরি মুছে ফেলতে চান?`)) return;

    const persistedIds = selected
      .filter((r) => r.id !== undefined)
      .map((r) => r.id as string);
    const localKeys = new Set(
      selected.filter((r) => r.id === undefined).map((r) => r._key),
    );

    setDeleting(true);
    try {
      if (persistedIds.length > 0) {
        await examCategoryService.bulkDelete(persistedIds);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-400 px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/categories">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>

        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">
            বাল্ক ক্যাটাগরি ব্যবস্থাপনা
          </h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} টি ক্যাটাগরি
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

      {savedCount !== null && (
        <div className="mb-4 rounded-md bg-green-50 px-4 py-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
          ✓ {savedCount} টি ক্যাটাগরি সফলভাবে সংরক্ষিত হয়েছে
        </div>
      )}

      {/* Table */}
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
              <th className="min-w-40 px-3 py-2 text-left font-medium">নাম</th>
              <th className="min-w-40 px-3 py-2 text-left font-medium">
                স্লাগ
              </th>
              <th className="min-w-20 px-3 py-2 text-left font-medium">আইকন</th>
              <th className="min-w-25 px-3 py-2 text-left font-medium">ক্রম</th>
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
                    value={row.name}
                    onChange={(e) =>
                      updateRow(row._key, { name: e.target.value })
                    }
                    placeholder="ক্যাটাগরির নাম"
                    className="min-w-36 h-8 text-sm"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    value={row.slug}
                    onChange={(e) =>
                      updateRow(row._key, { slug: e.target.value })
                    }
                    placeholder="slug-here"
                    className="min-w-36 h-8 text-sm font-mono"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    value={row.icon}
                    onChange={(e) =>
                      updateRow(row._key, { icon: e.target.value })
                    }
                    placeholder="🏛️"
                    className="min-w-16 h-8 text-sm"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    type="number"
                    value={row.sortOrder}
                    onChange={(e) =>
                      updateRow(row._key, {
                        sortOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className="min-w-16 h-8 text-sm"
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
            কোনো ক্যাটাগরি নেই। নতুন সারি যোগ করুন।
          </div>
        )}
      </div>
    </div>
  );
}
