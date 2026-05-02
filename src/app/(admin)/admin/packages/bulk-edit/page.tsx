"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  BulkUpsertPackageItem,
  PackageDto,
} from "@/features/subscriptions";
import { subscriptionService } from "@/features/subscriptions";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

// ─── Row state ──────────────────────────────────────────────────────────────

interface RowData {
  _key: string;
  id: string | undefined;
  name: string;
  durationDays: number;
  price: number;
  discount: number;
  description: string;
  liveQuota: string;
  archiveQuota: string;
  sortOrder: number;
  isActive: boolean;
  dirty: boolean;
  selected: boolean;
}

let _keyCounter = 0;
function nextKey() {
  return `row-${++_keyCounter}`;
}

function pkgToRow(p: PackageDto): RowData {
  return {
    _key: nextKey(),
    id: p.id,
    name: p.name,
    durationDays: p.durationDays,
    price: p.price,
    discount: p.discount,
    description: p.description ?? "",
    liveQuota: p.liveQuota !== null ? String(p.liveQuota) : "",
    archiveQuota: p.archiveQuota !== null ? String(p.archiveQuota) : "",
    sortOrder: p.sortOrder,
    isActive: p.isActive,
    dirty: false,
    selected: false,
  };
}

function emptyRow(): RowData {
  return {
    _key: nextKey(),
    id: undefined,
    name: "",
    durationDays: 365,
    price: 0,
    discount: 0,
    description: "",
    liveQuota: "",
    archiveQuota: "",
    sortOrder: 0,
    isActive: true,
    dirty: true,
    selected: false,
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PackagesBulkEditPage() {
  const [rows, setRows] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  useEffect(() => {
    subscriptionService
      .getAdminPackages()
      .then((pkgs) => setRows(pkgs.map(pkgToRow)))
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
      if (!r.name.trim()) {
        alert(`প্যাকেজের নাম পূরণ করুন।`);
        return;
      }
    }

    setSaving(true);
    setSavedCount(null);
    try {
      const payload: BulkUpsertPackageItem[] = dirtyRows.map((r) => ({
        ...(r.id ? { id: r.id } : {}),
        name: r.name.trim(),
        durationDays: r.durationDays,
        price: r.price,
        discount: r.discount || undefined,
        description: r.description.trim() || undefined,
        liveQuota: r.liveQuota ? parseInt(r.liveQuota) : null,
        archiveQuota: r.archiveQuota ? parseInt(r.archiveQuota) : null,
        sortOrder: r.sortOrder,
        isActive: r.isActive,
      }));

      const saved = await subscriptionService.bulkUpsertPackages(payload);

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
    if (!confirm(`${selected.length} টি প্যাকেজ মুছে ফেলতে চান?`)) return;

    const persistedIds = selected
      .filter((r) => r.id !== undefined)
      .map((r) => r.id as string);
    const localKeys = new Set(
      selected.filter((r) => r.id === undefined).map((r) => r._key),
    );

    setDeleting(true);
    try {
      if (persistedIds.length > 0) {
        await subscriptionService.bulkDeletePackages(persistedIds);
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
          <Link href="/admin/packages">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>

        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">
            বাল্ক প্যাকেজ ব্যবস্থাপনা
          </h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} টি প্যাকেজ
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
          ✓ {savedCount} টি প্যাকেজ সফলভাবে সংরক্ষিত হয়েছে
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
              <th className="min-w-25 px-3 py-2 text-left font-medium">
                মেয়াদ (দিন)
              </th>
              <th className="min-w-25 px-3 py-2 text-left font-medium">
                মূল্য (৳)
              </th>
              <th className="min-w-25 px-3 py-2 text-left font-medium">
                ছাড় (৳)
              </th>
              <th className="min-w-25 px-3 py-2 text-left font-medium">
                লাইভ কোটা
              </th>
              <th className="min-w-25 px-3 py-2 text-left font-medium">
                আর্কাইভ কোটা
              </th>
              <th className="min-w-25 px-3 py-2 text-left font-medium">ক্রম</th>
              <th className="min-w-50 px-3 py-2 text-left font-medium">
                বিবরণ
              </th>
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
                    placeholder="প্যাকেজের নাম"
                    className="min-w-36 h-8 text-sm"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    type="number"
                    value={row.durationDays}
                    onChange={(e) =>
                      updateRow(row._key, {
                        durationDays: parseInt(e.target.value) || 1,
                      })
                    }
                    min={1}
                    className="min-w-20 h-8 text-sm"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    type="number"
                    value={row.price}
                    onChange={(e) =>
                      updateRow(row._key, {
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    min={0}
                    className="min-w-20 h-8 text-sm"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    type="number"
                    value={row.discount}
                    onChange={(e) =>
                      updateRow(row._key, {
                        discount: parseFloat(e.target.value) || 0,
                      })
                    }
                    min={0}
                    className="min-w-20 h-8 text-sm"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    type="number"
                    value={row.liveQuota}
                    onChange={(e) =>
                      updateRow(row._key, { liveQuota: e.target.value })
                    }
                    placeholder="∞"
                    min={0}
                    className="min-w-20 h-8 text-sm"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    type="number"
                    value={row.archiveQuota}
                    onChange={(e) =>
                      updateRow(row._key, { archiveQuota: e.target.value })
                    }
                    placeholder="∞"
                    min={0}
                    className="min-w-20 h-8 text-sm"
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
                <td className="px-2 py-1.5">
                  <Textarea
                    value={row.description}
                    onChange={(e) =>
                      updateRow(row._key, { description: e.target.value })
                    }
                    placeholder="বিবরণ (ঐচ্ছিক)"
                    className="min-w-44 min-h-16 text-sm resize-none"
                    rows={2}
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
            কোনো প্যাকেজ নেই। নতুন সারি যোগ করুন।
          </div>
        )}
      </div>
    </div>
  );
}
