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
import type {
  BulkUpsertJobCircularItem,
  CircularStatus,
  JobCircular,
  OrgType,
} from "@/features/job-circular";
import { jobCircularService } from "@/features/job-circular";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

// ─── Constants ─────────────────────────────────────────────────────────────

const ORG_TYPES: { value: OrgType; label: string }[] = [
  { value: "GOVERNMENT", label: "সরকারি" },
  { value: "PRIVATE", label: "বেসরকারি" },
  { value: "AUTONOMOUS", label: "স্বায়ত্তশাসিত" },
  { value: "NGO", label: "এনজিও" },
];

const STATUSES: { value: CircularStatus; label: string }[] = [
  { value: "LIVE", label: "সক্রিয়" },
  { value: "UPCOMING", label: "আসছে" },
  { value: "EXPIRED", label: "মেয়াদোত্তীর্ণ" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Row state ─────────────────────────────────────────────────────────────

interface RowData {
  _key: string;
  id: string | undefined;
  gjobId: string;
  organizationName: string;
  organizationSlug: string;
  orgType: OrgType;
  title: string;
  totalPosts: number;
  salary: string;
  category: string;
  ministry: string;
  location: string;
  publishDate: string;
  deadline: string;
  examDate: string;
  applicationUrl: string;
  source: string;
  logoUrl: string;
  status: CircularStatus;
  isActive: boolean;
  dirty: boolean;
  selected: boolean;
}

let _keyCounter = 0;
function nextKey() {
  return `row-${++_keyCounter}`;
}

function circularToRow(c: JobCircular): RowData {
  return {
    _key: nextKey(),
    id: c.id,
    gjobId: c.gjobId ?? "",
    organizationName: c.organizationName,
    organizationSlug: c.organizationSlug,
    orgType: c.orgType,
    title: c.title,
    totalPosts: c.totalPosts,
    salary: c.salary ?? "",
    category: c.category ?? "",
    ministry: c.ministry ?? "",
    location: c.location ?? "",
    publishDate: c.publishDate ? c.publishDate.slice(0, 10) : "",
    deadline: c.deadline ? c.deadline.slice(0, 10) : "",
    examDate: c.examDate ? c.examDate.slice(0, 10) : "",
    applicationUrl: c.applicationUrl ?? "",
    source: c.source ?? "",
    logoUrl: c.logoUrl ?? "",
    status: c.status,
    isActive: c.isActive,
    dirty: false,
    selected: false,
  };
}

function emptyRow(): RowData {
  return {
    _key: nextKey(),
    id: undefined,
    gjobId: "",
    organizationName: "",
    organizationSlug: "",
    orgType: "GOVERNMENT",
    title: "",
    totalPosts: 0,
    salary: "",
    category: "",
    ministry: "",
    location: "",
    publishDate: new Date().toISOString().split("T")[0]!,
    deadline: "",
    examDate: "",
    applicationUrl: "",
    source: "",
    logoUrl: "",
    status: "LIVE",
    isActive: true,
    dirty: true,
    selected: false,
  };
}

// ─── Page ───────────────────────────────────────────────────────────────────

const LIMIT = 100;

export default function JobCircularBulkEditPage() {
  const [rows, setRows] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<CircularStatus | "all">(
    "all",
  );
  const [orgTypeFilter, setOrgTypeFilter] = useState<OrgType | "all">("all");

  const load = useCallback(async () => {
    setLoading(true);
    setSavedCount(null);
    try {
      const res = await jobCircularService.getAll({
        limit: LIMIT,
        status: statusFilter !== "all" ? statusFilter : undefined,
        orgType: orgTypeFilter !== "all" ? orgTypeFilter : undefined,
      });
      setRows(res.data.map(circularToRow));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, orgTypeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const updateRow = useCallback((key: string, patch: Partial<RowData>) => {
    setRows((prev) =>
      prev.map((r) => (r._key === key ? { ...r, ...patch, dirty: true } : r)),
    );
  }, []);

  const updateOrgName = useCallback((key: string, value: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r._key === key
          ? {
              ...r,
              organizationName: value,
              organizationSlug: r.id ? r.organizationSlug : slugify(value),
              dirty: true,
            }
          : r,
      ),
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

  // ── Save dirty rows ──────────────────────────────────────────────────────

  const handleSave = async () => {
    const dirtyRows = rows.filter((r) => r.dirty);
    if (dirtyRows.length === 0) return;

    for (const r of dirtyRows) {
      if (!r.organizationName.trim() || !r.title.trim()) {
        alert("প্রতিষ্ঠানের নাম এবং পদের শিরোনাম পূরণ করুন।");
        return;
      }
    }

    setSaving(true);
    setSavedCount(null);
    try {
      const payload: BulkUpsertJobCircularItem[] = dirtyRows.map((r) => ({
        ...(r.id ? { id: r.id } : {}),
        gjobId: r.gjobId || undefined,
        organizationName: r.organizationName.trim(),
        organizationSlug:
          r.organizationSlug.trim() || slugify(r.organizationName),
        orgType: r.orgType,
        title: r.title.trim(),
        totalPosts: r.totalPosts,
        salary: r.salary || undefined,
        category: r.category || undefined,
        ministry: r.ministry || undefined,
        location: r.location || undefined,
        publishDate: r.publishDate || undefined,
        deadline: r.deadline || undefined,
        examDate: r.examDate || undefined,
        applicationUrl: r.applicationUrl || undefined,
        source: r.source || undefined,
        logoUrl: r.logoUrl || undefined,
        status: r.status,
        isActive: r.isActive,
      }));

      const saved = await jobCircularService.bulkUpsert(payload);

      const savedMap = new Map(saved.map((s, i) => [dirtyRows[i]!._key, s]));
      setRows((prev) =>
        prev.map((r) => {
          const s = savedMap.get(r._key);
          return s
            ? { ...circularToRow(s), _key: r._key, selected: r.selected }
            : r;
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

  // ── Bulk delete ──────────────────────────────────────────────────────────

  const handleBulkDelete = async () => {
    const selected = rows.filter((r) => r.selected);
    if (selected.length === 0) return;
    if (!confirm(`${selected.length} টি বিজ্ঞপ্তি মুছে ফেলতে চান?`)) return;

    const persistedIds = selected
      .filter((r) => r.id !== undefined)
      .map((r) => r.id as string);
    const localKeys = new Set(
      selected.filter((r) => r.id === undefined).map((r) => r._key),
    );

    setDeleting(true);
    try {
      if (persistedIds.length > 0) {
        await jobCircularService.bulkDelete(persistedIds);
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
          <Link href="/admin/job-circular">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>

        <div className="flex-1">
          <h1 className="text-xl font-semibold tracking-tight">
            বাল্ক বিজ্ঞপ্তি ব্যবস্থাপনা
          </h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} টি বিজ্ঞপ্তি
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

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="w-44">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as CircularStatus | "all")}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="অবস্থা" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব অবস্থা</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-44">
          <Select
            value={orgTypeFilter}
            onValueChange={(v) => setOrgTypeFilter(v as OrgType | "all")}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="প্রতিষ্ঠান ধরন" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব ধরন</SelectItem>
              {ORG_TYPES.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {savedCount !== null && (
        <div className="mb-4 rounded-md bg-green-50 px-4 py-2 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
          ✓ {savedCount} টি বিজ্ঞপ্তি সফলভাবে সংরক্ষিত হয়েছে
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
                <th className="min-w-28 px-3 py-2 text-left font-medium">
                  Job ID
                </th>
                <th className="min-w-48 px-3 py-2 text-left font-medium">
                  প্রতিষ্ঠান
                </th>
                <th className="min-w-44 px-3 py-2 text-left font-medium">
                  পদের শিরোনাম
                </th>
                <th className="min-w-28 px-3 py-2 text-left font-medium">
                  ধরন
                </th>
                <th className="min-w-20 px-3 py-2 text-left font-medium">পদ</th>
                <th className="min-w-36 px-3 py-2 text-left font-medium">
                  বেতন
                </th>
                <th className="min-w-32 px-3 py-2 text-left font-medium">
                  ক্যাটাগরি
                </th>
                <th className="min-w-32 px-3 py-2 text-left font-medium">
                  মন্ত্রণালয়
                </th>
                <th className="min-w-32 px-3 py-2 text-left font-medium">
                  প্রকাশের তারিখ
                </th>
                <th className="min-w-32 px-3 py-2 text-left font-medium">
                  শেষ তারিখ
                </th>
                <th className="min-w-32 px-3 py-2 text-left font-medium">
                  পরীক্ষার তারিখ
                </th>
                <th className="min-w-28 px-3 py-2 text-left font-medium">
                  অবস্থা
                </th>
                <th className="w-16 px-3 py-2 text-center font-medium">
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
                      value={row.gjobId}
                      onChange={(e) =>
                        updateRow(row._key, { gjobId: e.target.value })
                      }
                      placeholder="GJOB13733"
                      className="min-w-24 h-8 text-sm font-mono"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input
                      value={row.organizationName}
                      onChange={(e) => updateOrgName(row._key, e.target.value)}
                      placeholder="প্রতিষ্ঠানের নাম"
                      className="min-w-44 h-8 text-sm"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input
                      value={row.title}
                      onChange={(e) =>
                        updateRow(row._key, { title: e.target.value })
                      }
                      placeholder="পদের শিরোনাম"
                      className="min-w-40 h-8 text-sm"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Select
                      value={row.orgType}
                      onValueChange={(v) =>
                        updateRow(row._key, { orgType: v as OrgType })
                      }
                    >
                      <SelectTrigger className="h-8 text-sm min-w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORG_TYPES.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-2 py-1.5">
                    <Input
                      type="number"
                      value={row.totalPosts}
                      onChange={(e) =>
                        updateRow(row._key, {
                          totalPosts: parseInt(e.target.value) || 0,
                        })
                      }
                      min={0}
                      className="min-w-16 h-8 text-sm"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input
                      value={row.salary}
                      onChange={(e) =>
                        updateRow(row._key, { salary: e.target.value })
                      }
                      placeholder="বেতন"
                      className="min-w-28 h-8 text-sm"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input
                      value={row.category}
                      onChange={(e) =>
                        updateRow(row._key, { category: e.target.value })
                      }
                      placeholder="ক্যাটাগরি"
                      className="min-w-28 h-8 text-sm"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input
                      value={row.ministry}
                      onChange={(e) =>
                        updateRow(row._key, { ministry: e.target.value })
                      }
                      placeholder="মন্ত্রণালয়"
                      className="min-w-28 h-8 text-sm"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input
                      type="date"
                      value={row.publishDate}
                      onChange={(e) =>
                        updateRow(row._key, { publishDate: e.target.value })
                      }
                      className="min-w-32 h-8 text-sm"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input
                      type="date"
                      value={row.deadline}
                      onChange={(e) =>
                        updateRow(row._key, { deadline: e.target.value })
                      }
                      className="min-w-32 h-8 text-sm"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input
                      type="date"
                      value={row.examDate}
                      onChange={(e) =>
                        updateRow(row._key, { examDate: e.target.value })
                      }
                      className="min-w-32 h-8 text-sm"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Select
                      value={row.status}
                      onValueChange={(v) =>
                        updateRow(row._key, { status: v as CircularStatus })
                      }
                    >
                      <SelectTrigger className="h-8 text-sm min-w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
              কোনো বিজ্ঞপ্তি নেই। নতুন সারি যোগ করুন।
            </div>
          )}
        </div>
      )}
    </div>
  );
}
