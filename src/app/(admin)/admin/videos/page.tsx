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
import {
  VIDEO_CATEGORIES,
  categoryLabel,
  formatViewCount,
} from "@/features/videos/constants";
import { videoService } from "@/features/videos";
import type {
  CreateVideoInput,
  Video,
  VideoCategory,
} from "@/features/videos/types";
import { YoutubePlayer } from "@/features/videos/components/youtube-player";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const EMPTY: CreateVideoInput = {
  title: "",
  description: "",
  youtubeUrl: "",
  category: "OTHER",
  tags: [],
  durationSec: undefined,
  isFeatured: false,
  isActive: true,
};

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<VideoCategory | "ALL">("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Video | null>(null);
  const [form, setForm] = useState<CreateVideoInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, stats] = await Promise.all([
        videoService.adminGetAll({
          page,
          limit: 20,
          search: search || undefined,
          category: categoryFilter === "ALL" ? undefined : categoryFilter,
          includeInactive: true,
        }),
        videoService.adminStats(),
      ]);
      setVideos(list.data);
      setTotalPages(list.totalPages);
      setTotal(stats.total);
    } catch {
      toast.error("ভিডিও লোড করা যায়নি");
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setTagsInput("");
    setPreviewId(null);
    setDialogOpen(true);
  }

  function openEdit(v: Video) {
    setEditing(v);
    setForm({
      title: v.title,
      description: v.description ?? "",
      youtubeUrl: v.youtubeUrl,
      category: v.category,
      tags: v.tags,
      durationSec: v.durationSec ?? undefined,
      isFeatured: v.isFeatured,
      isActive: v.isActive,
    });
    setTagsInput(v.tags.join(", "));
    setPreviewId(v.youtubeVideoId);
    setDialogOpen(true);
  }

  async function parseYoutube() {
    if (!form.youtubeUrl.trim()) return;
    setParsing(true);
    try {
      const meta = await videoService.adminParseYoutube(form.youtubeUrl.trim());
      setPreviewId(meta.youtubeVideoId);
      setForm((f) => ({ ...f, youtubeUrl: meta.youtubeUrl }));
      toast.success("YouTube লিংক যাচাই হয়েছে");
    } catch {
      toast.error("সঠিক YouTube লিংক দিন");
      setPreviewId(null);
    } finally {
      setParsing(false);
    }
  }

  async function handleSave() {
    if (!form.title.trim() || !form.youtubeUrl.trim()) {
      toast.error("শিরোনাম ও YouTube লিংক প্রয়োজন");
      return;
    }
    setSaving(true);
    try {
      const payload: CreateVideoInput = {
        ...form,
        tags: tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      if (editing) {
        await videoService.adminUpdate(editing.id, payload);
        toast.success("ভিডিও আপডেট হয়েছে");
      } else {
        await videoService.adminCreate(payload);
        toast.success("ভিডিও যোগ হয়েছে");
      }
      setDialogOpen(false);
      load();
    } catch {
      toast.error("সংরক্ষণ করা যায়নি");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(v: Video) {
    if (!confirm(`"${v.title}" মুছে ফেলতে চান?`)) return;
    try {
      await videoService.adminDelete(v.id);
      toast.success("মুছে ফেলা হয়েছে");
      load();
    } catch {
      toast.error("মুছে ফেলা যায়নি");
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <AdminPageHeader
        title="ভিডিও লাইব্রেরি"
        subtitle="YouTube লেকচার যোগ, সম্পাদনা ও পরিচালনা"
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled title="শীঘ্রই আসছে">
            <Youtube className="mr-2 size-4" />
            চ্যানেল ইমপোর্ট
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            নতুন ভিডিও
          </Button>
        </div>
      </AdminPageHeader>

      <AdminStatsBar
        stats={[
          { label: "মোট ভিডিও", value: total, icon: <Eye className="size-4" /> },
          {
            label: "ফিচার্ড (এই পৃষ্ঠায়)",
            value: videos.filter((v) => v.isFeatured).length,
            icon: <Sparkles className="size-4" />,
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
          value={categoryFilter}
          onValueChange={(v) => {
            setCategoryFilter(v as VideoCategory | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="ক্যাটাগরি" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">সব ক্যাটাগরি</SelectItem>
            {VIDEO_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <TableSkeleton rows={8} />
      ) : videos.length === 0 ? (
        <AdminEmptyState
          title="কোনো ভিডিও নেই"
          description="YouTube লিংক দিয়ে প্রথম ভিডিও যোগ করুন"
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-2 size-4" />
              ভিডিও যোগ করুন
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">থাম্ব</TableHead>
                <TableHead>শিরোনাম</TableHead>
                <TableHead>ক্যাটাগরি</TableHead>
                <TableHead>দেখা / লাইক</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <Image
                      src={
                        v.thumbnailUrl ??
                        `https://img.youtube.com/vi/${v.youtubeVideoId}/default.jpg`
                      }
                      alt=""
                      width={64}
                      height={36}
                      className="rounded object-cover"
                      unoptimized
                    />
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 max-w-xs font-medium">{v.title}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{categoryLabel(v.category)}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatViewCount(v.viewCount)} / {v.likeCount}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {v.isFeatured && (
                        <Badge className="bg-amber-500">ফিচার্ড</Badge>
                      )}
                      <Badge variant={v.isActive ? "default" : "outline"}>
                        {v.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(v)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(v)}
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
              {editing ? "ভিডিও সম্পাদনা" : "নতুন ভিডিও যোগ করুন"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>YouTube লিংক *</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={form.youtubeUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, youtubeUrl: e.target.value }))
                  }
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={parseYoutube}
                  disabled={parsing}
                >
                  {parsing ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "যাচাই"
                  )}
                </Button>
              </div>
            </div>

            {previewId && (
              <YoutubePlayer videoId={previewId} title="প্রিভিউ" />
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
                <Label>ক্যাটাগরি</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, category: v as VideoCategory }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VIDEO_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>সময় (সেকেন্ড)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.durationSec ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      durationSec: e.target.value
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
                placeholder="বাংলা, প্রিলি, গণিত"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-4">
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
                {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                সংরক্ষণ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
