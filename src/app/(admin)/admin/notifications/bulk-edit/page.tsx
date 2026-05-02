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
  BulkUpsertNotificationItem,
  Notification,
} from "@/features/notifications";
import { notificationService } from "@/features/notifications";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

// ─── Row state ──────────────────────────────────────────────────────────────

interface RowData {
  _key: string;
  id: string | undefined;
  title: string;
  content: string;
  type: "PUBLIC" | "SPECIFIC";
  targetUserId: string;
  isActive: boolean;
  dirty: boolean;
  selected: boolean;
}

let _keyCounter = 0;
function nextKey() {
  return `row-${++_keyCounter}`;
}

function notifToRow(n: Notification): RowData {
  return {
    _key: nextKey(),
    id: n.id,
    title: n.title,
    content: n.content,
    type: n.type,
    targetUserId: n.targetUserId ?? "",
    isActive: n.isActive,
    dirty: false,
    selected: false,
  };
}

function emptyRow(): RowData {
  return {
    _key: nextKey(),
    id: undefined,
    title: "",
    content: "",
    type: "PUBLIC",
    targetUserId: "",
    isActive: true,
    dirty: true,
    selected: false,
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NotificationsBulkEditPage() {
  const [rows, setRows] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  useEffect(() => {
    notificationService
      .getAll()
      .then((notifs) => setRows(notifs.map(notifToRow)))
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
      if (!r.title.trim() || !r.content.trim()) {
        alert(`শিরোনাম ও বিষয়বস্তু পূরণ করুন। (Row: ${r.title || "নতুন"})`);
        return;
      }
      if (r.type === "SPECIFIC" && !r.targetUserId.trim()) {
        alert(`SPECIFIC নোটিফিকেশনে টার্গেট ইউজার আইডি দিন।`);
        return;
      }
    }

    setSaving(true);
    setSavedCount(null);
    try {
      const payload: BulkUpsertNotificationItem[] = dirtyRows.map((r) => ({
        ...(r.id ? { id: r.id } : {}),
        title: r.title.trim(),
        content: r.content.trim(),
        type: r.type,
        targetUserId: r.targetUserId.trim() || undefined,
        isActive: r.isActive,
      }));

      const saved = await notificationService.bulkUpsert(payload);

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
    if (!confirm(`${selected.length} টি নোটিফিকেশন মুছে ফেলতে চান?`)) return;

    const persistedIds = selected
      .filter((r) => r.id !== undefined)
      .map((r) => r.id as string);
    const localKeys = new Set(
      selected.filter((r) => r.id === undefined).map((r) => r._key),
    );

    setDeleting(true);
    try {
      if (persistedIds.length > 0) {
        await notificationService.bulkDelete(persistedIds);
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
          <Link href="/admin/notifications">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>

        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">
            বাল্ক নোটিফিকেশন ব্যবস্থাপনা
          </h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} টি নোটিফিকেশন
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
          ✓ {savedCount} টি নোটিফিকেশন সফলভাবে সংরক্ষিত হয়েছে
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
              <th className="min-w-40 px-3 py-2 text-left font-medium">
                শিরোনাম
              </th>
              <th className="min-w-60 px-3 py-2 text-left font-medium">
                বিষয়বস্তু
              </th>
              <th className="min-w-30 px-3 py-2 text-left font-medium">ধরন</th>
              <th className="min-w-40 px-3 py-2 text-left font-medium">
                টার্গেট ইউজার
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
                    value={row.title}
                    onChange={(e) =>
                      updateRow(row._key, { title: e.target.value })
                    }
                    placeholder="শিরোনাম"
                    className="min-w-36 h-8 text-sm"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Textarea
                    value={row.content}
                    onChange={(e) =>
                      updateRow(row._key, { content: e.target.value })
                    }
                    placeholder="বিষয়বস্তু লিখুন..."
                    className="min-w-56 min-h-16 text-sm resize-none"
                    rows={2}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <Select
                    value={row.type}
                    onValueChange={(v) =>
                      updateRow(row._key, {
                        type: v as "PUBLIC" | "SPECIFIC",
                      })
                    }
                  >
                    <SelectTrigger className="min-w-28 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">PUBLIC</SelectItem>
                      <SelectItem value="SPECIFIC">SPECIFIC</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-2 py-1.5">
                  <Input
                    value={row.targetUserId}
                    onChange={(e) =>
                      updateRow(row._key, { targetUserId: e.target.value })
                    }
                    placeholder="User ID (SPECIFIC only)"
                    disabled={row.type === "PUBLIC"}
                    className="min-w-36 h-8 text-sm"
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
            কোনো নোটিফিকেশন নেই। নতুন সারি যোগ করুন।
          </div>
        )}
      </div>
    </div>
  );
}
