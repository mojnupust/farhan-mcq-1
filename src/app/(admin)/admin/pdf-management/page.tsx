"use client";

import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatsBar } from "@/components/admin/admin-stats-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PdfPreview } from "@/features/pdfs/components/pdf-preview";
import {
  PDF_DOC_TYPES,
  SUB_EXAM_CATEGORIES,
  docTypeLabel,
  formatCount,
  formatFileSize,
  looksLikeFileUrl,
  subExamCategoryLabel,
} from "@/features/pdfs/constants";
import { INITIAL_PDFS } from "@/features/pdfs/mock-data";
import type {
  CreatePdfInput,
  PdfDocType,
  PdfDocument,
} from "@/features/pdfs/types";

// NOTE: everything on this page runs against INITIAL_PDFS in local state.
// There is no `pdfService` yet — once /api/admin/pdfs exists, replace the
// state mutations in handleSave/handleDelete with real calls (see TODOs
// below) the same way features/videos/index.ts wraps the video endpoints.

const EMPTY: CreatePdfInput = {
  title: "",
  description: "",
  fileUrl: "",
  docType: "OTHER",
  subExamCategoryId: undefined,
  subject: "",
  examName: "",
  tags: [],
  fileSizeKb: undefined,
  pageCount: undefined,
  isFeatured: false,
  isActive: true,
  isFree: false,
};

const PAGE_SIZE = 8;

export default function AdminPdfsPage() {
  const [pdfs, setPdfs] = useState<PdfDocument[]>(INITIAL_PDFS);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState<PdfDocType | "ALL">("ALL");
  const [subExamFilter, setSubExamFilter] = useState<string>("ALL");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PdfDocument | null>(null);
  const [form, setForm] = useState<CreatePdfInput>(EMPTY);
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pdfs.filter((p) => {
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.subject?.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      const matchesType =
        docTypeFilter === "ALL" || p.docType === docTypeFilter;
      const matchesSubExam =
        subExamFilter === "ALL" || p.subExamCategoryId === subExamFilter;
      return matchesSearch && matchesType && matchesSubExam;
    });
  }, [pdfs, search, docTypeFilter, subExamFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(
    () => ({
      total: pdfs.length,
      free: pdfs.filter((p) => p.isFree).length,
      featured: pdfs.filter((p) => p.isFeatured).length,
      downloads: pdfs.reduce((sum, p) => sum + p.downloadCount, 0),
    }),
    [pdfs],
  );

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setTagsInput("");
    setDialogOpen(true);
  }

  function openEdit(p: PdfDocument) {
    setEditing(p);
    setForm({
      title: p.title,
      description: p.description ?? "",
      fileUrl: p.fileUrl,
      docType: p.docType,
      subExamCategoryId: p.subExamCategoryId ?? undefined,
      subject: p.subject ?? "",
      examName: p.examName ?? "",
      tags: p.tags,
      fileSizeKb: p.fileSizeKb,
      pageCount: p.pageCount,
      isFeatured: p.isFeatured,
      isActive: p.isActive,
      isFree: p.isFree,
    });
    setTagsInput(p.tags.join(", "));
    setDialogOpen(true);
  }

  function handleSave() {
    if (!form.title.trim() || !form.fileUrl.trim()) {
      toast.error("শিরোনাম ও PDF লিংক প্রয়োজন");
      return;
    }
    if (!looksLikeFileUrl(form.fileUrl)) {
      toast.error("সঠিক লিংক দিন (http:// অথবা https:// দিয়ে শুরু)");
      return;
    }

    setSaving(true);
    const payload: CreatePdfInput = {
      ...form,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    // TODO: await pdfService.adminUpdate(editing.id, payload) /
    // pdfService.adminCreate(payload) once the API is ready.
    if (editing) {
      setPdfs((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? { ...p, ...payload, updatedAt: new Date().toISOString() }
            : p,
        ),
      );
      toast.success("পিডিএফ আপডেট হয়েছে");
    } else {
      const newPdf: PdfDocument = {
        ...payload,
        id: `pdf_${Date.now()}`,
        downloadCount: 0,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPdfs((prev) => [newPdf, ...prev]);
      toast.success("পিডিএফ যোগ হয়েছে");
    }

    setSaving(false);
    setDialogOpen(false);
  }

  function handleDelete(p: PdfDocument) {
    if (!confirm(`"${p.title}" মুছে ফেলতে চান?`)) return;
    // TODO: await pdfService.adminDelete(p.id) once the API is ready.
    setPdfs((prev) => prev.filter((x) => x.id !== p.id));
    toast.success("মুছে ফেলা হয়েছে");
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <AdminPageHeader
        title="পিডিএফ লাইব্রেরি"
        subtitle="সিলেবাস, রুটিন, প্রশ্নব্যাংক ও নোট আপলোড ও পরিচালনা করুন"
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled title="শীঘ্রই আসছে">
            <UploadCloud className="mr-2 size-4" />
            বাল্ক আপলোড
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            নতুন পিডিএফ
          </Button>
        </div>
      </AdminPageHeader>

      <AdminStatsBar
        stats={[
          {
            label: "মোট পিডিএফ",
            value: stats.total,
            icon: <FileText className="size-4" />,
          },
          {
            label: "ফ্রি ফাইল",
            value: stats.free,
            icon: <Download className="size-4" />,
          },
          {
            label: "ফিচার্ড",
            value: stats.featured,
            icon: <Sparkles className="size-4" />,
          },
          {
            label: "মোট ডাউনলোড",
            value: formatCount(stats.downloads),
            icon: <Download className="size-4" />,
          },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="খুঁজুন..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={docTypeFilter}
          onValueChange={(v) => {
            setDocTypeFilter(v as PdfDocType | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="ধরন" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">সব ধরন</SelectItem>
            {PDF_DOC_TYPES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={subExamFilter}
          onValueChange={(v) => {
            setSubExamFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[240px]">
            <SelectValue placeholder="বিভাগ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">সব বিভাগ</SelectItem>
            {SUB_EXAM_CATEGORIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {pageItems.length === 0 ? (
        <AdminEmptyState
          title="কোনো পিডিএফ নেই"
          description="লিংক দিয়ে প্রথম পিডিএফ যোগ করুন"
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-2 size-4" />
              পিডিএফ যোগ করুন
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ফাইল</TableHead>
                <TableHead>শিরোনাম</TableHead>
                <TableHead>বিভাগ</TableHead>
                <TableHead>সাইজ / পৃষ্ঠা</TableHead>
                <TableHead>ডাউনলোড</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
                      <FileText className="size-5" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 max-w-xs font-medium">
                      {p.title}
                    </p>
                    {p.subject && (
                      <p className="text-xs text-muted-foreground">
                        {p.subject}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant="secondary" className="w-fit">
                        {docTypeLabel(p.docType)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {subExamCategoryLabel(p.subExamCategoryId)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatFileSize(p.fileSizeKb)}
                    {p.pageCount ? ` / ${p.pageCount}p` : ""}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatCount(p.downloadCount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.isFree && (
                        <Badge className="bg-emerald-600">ফ্রি</Badge>
                      )}
                      {p.isFeatured && (
                        <Badge className="bg-amber-500">ফিচার্ড</Badge>
                      )}
                      <Badge variant={p.isActive ? "default" : "outline"}>
                        {p.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(p)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(p)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="flex items-center text-sm">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "পিডিএফ সম্পাদনা" : "নতুন পিডিএফ যোগ করুন"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>PDF ফাইল লিংক *</Label>
              <Input
                placeholder="https://cdn.farhanmcq.com/pdfs/..."
                value={form.fileUrl}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fileUrl: e.target.value }))
                }
              />
            </div>

            {looksLikeFileUrl(form.fileUrl) && (
              <PdfPreview
                fileUrl={form.fileUrl}
                title={form.title}
                fileSizeKb={form.fileSizeKb}
                pageCount={form.pageCount}
              />
            )}

            <div className="space-y-2">
              <Label>শিরোনাম *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>বিবরণ</Label>
              <Textarea
                rows={3}
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>ধরন</Label>
                <Select
                  value={form.docType}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, docType: v as PdfDocType }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PDF_DOC_TYPES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>সম্পর্কিত বিভাগ</Label>
                <Select
                  value={form.subExamCategoryId ?? "NONE"}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      subExamCategoryId: v === "NONE" ? undefined : v,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">সাধারণ (নির্দিষ্ট নয়)</SelectItem>
                    {SUB_EXAM_CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>বিষয়</Label>
                <Input
                  placeholder="বাংলা, গণিত, ICT..."
                  value={form.subject ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subject: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>পরীক্ষার নাম</Label>
                <Input
                  placeholder="৫০তম বিসিএস, 19th NTRCA..."
                  value={form.examName ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, examName: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>পৃষ্ঠা সংখ্যা</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.pageCount ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      pageCount: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>ফাইল সাইজ (KB)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.fileSizeKb ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      fileSizeKb: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>ট্যাগ (কমা দিয়ে)</Label>
              <Input
                placeholder="NTRCA, সিলেবাস, ফ্রি"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isFree}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isFree: e.target.checked }))
                  }
                />
                ফ্রি
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isFeatured: e.target.checked }))
                  }
                />
                ফিচার্ড
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isActive: e.target.checked }))
                  }
                />
                সক্রিয়
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                বাতিল
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                সংরক্ষণ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
