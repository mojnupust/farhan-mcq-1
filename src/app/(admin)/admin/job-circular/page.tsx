"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type {
  CircularStatus,
  CreateJobCircularInput,
  JobCircular,
  OrgType,
  UpdateJobCircularInput,
} from "@/features/job-circular";
import { jobCircularService } from "@/features/job-circular";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────

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

const STATUS_COLORS: Record<CircularStatus, string> = {
  LIVE: "bg-emerald-500/15 text-emerald-700",
  UPCOMING: "bg-blue-500/15 text-blue-700",
  EXPIRED: "bg-muted text-muted-foreground",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Empty Form ───────────────────────────────────────────────────────────

const EMPTY_FORM: CreateJobCircularInput = {
  gjobId: "",
  organizationName: "",
  organizationSlug: "",
  orgType: "GOVERNMENT",
  logoUrl: "",
  title: "",
  totalPosts: 0,
  applicationUrl: "",
  publishDate: "",
  deadline: "",
  examDate: "",
  description: "",
  eligibility: "",
  salary: "",
  experience: "",
  location: "",
  source: "",
  category: "",
  ministry: "",
  status: "LIVE",
};

// ─── Form Dialog ──────────────────────────────────────────────────────────

function CircularFormDialog({
  open,
  onClose,
  onSaved,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing: JobCircular | null;
}) {
  const [form, setForm] = useState<CreateJobCircularInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        gjobId: editing.gjobId ?? "",
        organizationName: editing.organizationName,
        organizationSlug: editing.organizationSlug,
        orgType: editing.orgType as OrgType,
        logoUrl: editing.logoUrl ?? "",
        title: editing.title,
        totalPosts: editing.totalPosts,
        applicationUrl: editing.applicationUrl ?? "",
        publishDate: editing.publishDate
          ? editing.publishDate.slice(0, 10)
          : "",
        deadline: editing.deadline ? editing.deadline.slice(0, 10) : "",
        examDate: editing.examDate ? editing.examDate.slice(0, 10) : "",
        description: editing.description ?? "",
        eligibility: editing.eligibility ?? "",
        salary: editing.salary ?? "",
        experience: editing.experience ?? "",
        location: editing.location ?? "",
        source: editing.source ?? "",
        category: editing.category ?? "",
        ministry: editing.ministry ?? "",
        status: editing.status as CircularStatus,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editing, open]);

  const set = <K extends keyof CreateJobCircularInput>(
    k: K,
    v: CreateJobCircularInput[K],
  ) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleOrgName = (v: string) => {
    set("organizationName", v);
    if (!editing) set("organizationSlug", slugify(v));
  };

  const handleSave = async () => {
    if (!form.organizationName || !form.title) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        totalPosts: Number(form.totalPosts) || 0,
        gjobId: form.gjobId || undefined,
        logoUrl: form.logoUrl || undefined,
        applicationUrl: form.applicationUrl || undefined,
        publishDate: form.publishDate || undefined,
        deadline: form.deadline || undefined,
        examDate: form.examDate || undefined,
        description: form.description || undefined,
        eligibility: form.eligibility || undefined,
        salary: form.salary || undefined,
        experience: form.experience || undefined,
        location: form.location || undefined,
        source: form.source || undefined,
        category: form.category || undefined,
        ministry: form.ministry || undefined,
      };
      if (editing) {
        await jobCircularService.update(
          editing.id,
          payload as UpdateJobCircularInput,
        );
      } else {
        await jobCircularService.create(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? "বিজ্ঞপ্তি সম্পাদনা" : "নতুন বিজ্ঞপ্তি যোগ করুন"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Job ID (ঐচ্ছিক)</Label>
              <Input
                placeholder="GJOB13733"
                value={form.gjobId}
                onChange={(e) => set("gjobId", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>প্রতিষ্ঠান ধরন</Label>
              <Select
                value={form.orgType}
                onValueChange={(v) => set("orgType", v as OrgType)}
              >
                <SelectTrigger>
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
            </div>
          </div>

          {/* Org name */}
          <div className="space-y-1.5">
            <Label>প্রতিষ্ঠানের নাম *</Label>
            <Input
              placeholder="যেমন: Bangladesh Public Service Commission"
              value={form.organizationName}
              onChange={(e) => handleOrgName(e.target.value)}
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <Label>স্লাগ</Label>
            <Input
              placeholder="auto-generated"
              value={form.organizationSlug}
              onChange={(e) => set("organizationSlug", e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label>পদের নাম / শিরোনাম *</Label>
            <Input
              placeholder="যেমন: Assistant System Analyst"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          {/* Row: posts, salary, status */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>মোট পদ</Label>
              <Input
                type="number"
                min={0}
                value={form.totalPosts}
                onChange={(e) => set("totalPosts", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>বেতন</Label>
              <Input
                placeholder="যেমন: ৳২২,০০০ - ৳৫৩,০৬০"
                value={form.salary}
                onChange={(e) => set("salary", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>অবস্থা</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v as CircularStatus)}
              >
                <SelectTrigger>
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
            </div>
          </div>

          {/* Category + Ministry */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>ক্যাটাগরি</Label>
              <Input
                placeholder="যেমন: Bank, Ministry"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>মন্ত্রণালয়</Label>
              <Input
                placeholder="যেমন: অর্থ মন্ত্রণালয়"
                value={form.ministry}
                onChange={(e) => set("ministry", e.target.value)}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>প্রকাশের তারিখ</Label>
              <Input
                type="date"
                value={form.publishDate}
                onChange={(e) => set("publishDate", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>শেষ তারিখ</Label>
              <Input
                type="date"
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>পরীক্ষার তারিখ</Label>
              <Input
                type="date"
                value={form.examDate}
                onChange={(e) => set("examDate", e.target.value)}
              />
            </div>
          </div>

          {/* URLs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>আবেদন লিংক</Label>
              <Input
                placeholder="https://..."
                value={form.applicationUrl}
                onChange={(e) => set("applicationUrl", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>বিজ্ঞপ্তির উৎস</Label>
              <Input
                placeholder="https://..."
                value={form.source}
                onChange={(e) => set("source", e.target.value)}
              />
            </div>
          </div>

          {/* Logo URL */}
          <div className="space-y-1.5">
            <Label>লোগো URL</Label>
            <Input
              placeholder="https://..."
              value={form.logoUrl}
              onChange={(e) => set("logoUrl", e.target.value)}
            />
          </div>

          {/* Location + Experience */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>কর্মস্থল</Label>
              <Input
                placeholder="ঢাকা"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>অভিজ্ঞতা</Label>
              <Input
                placeholder="যেমন: ৩ বছর"
                value={form.experience}
                onChange={(e) => set("experience", e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>বিবরণ</Label>
            <Textarea
              placeholder="বিস্তারিত বিবরণ..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
            />
          </div>

          {/* Eligibility */}
          <div className="space-y-1.5">
            <Label>যোগ্যতা</Label>
            <Textarea
              placeholder="শিক্ষাগত যোগ্যতা, বয়সসীমা..."
              value={form.eligibility}
              onChange={(e) => set("eligibility", e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            বাতিল
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !form.organizationName || !form.title}
          >
            {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────

const LIMIT = 20;

export default function AdminJobCircularPage() {
  const [circulars, setCirculars] = useState<JobCircular[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<CircularStatus | "">("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<JobCircular | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await jobCircularService.getAll({
        page,
        limit: LIMIT,
        search: search || undefined,
        status: status || undefined,
      });
      setCirculars(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (c: JobCircular) => {
    setEditing(c);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই বিজ্ঞপ্তিটি মুছে ফেলবেন?")) return;
    setDeletingId(id);
    try {
      await jobCircularService.delete(id);
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString("bn-BD", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Briefcase className="size-5" />
            চাকরির বিজ্ঞপ্তি ব্যবস্থাপনা
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            মোট {total} টি বিজ্ঞপ্তি
          </p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-1.5">
          <Plus className="size-4" />
          নতুন যোগ করুন
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="বিজ্ঞপ্তি খুঁজুন..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select
          value={status || "all"}
          onValueChange={(v) => {
            setStatus(v === "all" ? "" : (v as CircularStatus));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36 h-9">
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
        <Button
          variant="ghost"
          size="sm"
          className="h-9"
          onClick={() => {
            setSearchInput("");
            setSearch("");
            setStatus("");
            setPage(1);
          }}
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4">
              <TableSkeleton rows={8} />
            </div>
          ) : circulars.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Briefcase className="mx-auto size-10 mb-3 text-muted-foreground/30" />
              কোনো বিজ্ঞপ্তি পাওয়া যায়নি
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>প্রতিষ্ঠান / পদ</TableHead>
                  <TableHead>ধরন</TableHead>
                  <TableHead>পদ</TableHead>
                  <TableHead>শেষ তারিখ</TableHead>
                  <TableHead>অবস্থা</TableHead>
                  <TableHead className="text-center">
                    <Eye className="size-4 inline" />
                  </TableHead>
                  <TableHead className="text-right">কার্যক্রম</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {circulars.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="max-w-xs">
                      <p className="font-medium text-sm truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {c.organizationName}
                        {c.gjobId && (
                          <span className="ml-1 font-mono text-muted-foreground/60">
                            #{c.gjobId}
                          </span>
                        )}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {ORG_TYPES.find((o) => o.value === c.orgType)?.label ??
                          c.orgType}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {c.totalPosts || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(c.deadline)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs border-0 ${STATUS_COLORS[c.status]}`}
                      >
                        {STATUSES.find((s) => s.value === c.status)?.label ??
                          c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {c.viewCount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7"
                          onClick={() => openEdit(c)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId === c.id}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            পৃষ্ঠা {page} / {totalPages}
          </p>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-4" />
              আগের
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              পরের
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <CircularFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={load}
        editing={editing}
      />
    </div>
  );
}
