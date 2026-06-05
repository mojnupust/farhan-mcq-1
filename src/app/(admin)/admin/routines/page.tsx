"use client";

import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatsBar } from "@/components/admin/admin-stats-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { ExamCategory } from "@/features/exam-categories";
import { examCategoryService } from "@/features/exam-categories";
import type { CreateRoutineInput, Routine } from "@/features/routines";
import { routineService } from "@/features/routines";
import type { SubExamCategory } from "@/features/sub-exam-categories";
import { subExamCategoryService } from "@/features/sub-exam-categories";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FolderOpen,
  Pencil,
  Plus,
  Table2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function toInputDate(dateStr: string): string {
  return new Date(dateStr).toISOString().split("T")[0];
}

const emptyForm: CreateRoutineInput = {
  subExamCategoryId: "",
  date: new Date().toISOString().split("T")[0],
  title: "",
  totalMarks: 50,
  duration: 10,
  subject: "",
  topics: "",
  sourceMaterial: "",
  description: "",
};

export default function AdminRoutinesPage() {
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [selectedCatId, setSelectedCatId] = useState("");
  const [subCategories, setSubCategories] = useState<SubExamCategory[]>([]);
  const [selectedSubSlug, setSelectedSubSlug] = useState("");
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateRoutineInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Load categories
  useEffect(() => {
    const load = async () => {
      try {
        const cats = await examCategoryService.getAll();
        setCategories(cats);
        if (cats.length > 0) setSelectedCatId(cats[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Load sub-categories when category changes
  useEffect(() => {
    if (!selectedCatId) return;
    const cat = categories.find((c) => c.id === selectedCatId);
    if (!cat) return;
    const load = async () => {
      try {
        const subs = await subExamCategoryService.getByCategorySlug(cat.slug);
        setSubCategories(subs);
        if (subs.length > 0) setSelectedSubSlug(subs[0].slug);
        else setSelectedSubSlug("");
      } catch (err) {
        console.error(err);
        setSubCategories([]);
      }
    };
    load();
  }, [selectedCatId, categories]);

  // Load routines when sub-category changes
  useEffect(() => {
    if (!selectedSubSlug) {
      setRoutines([]);
      return;
    }
    const load = async () => {
      try {
        const data = await routineService.getBySubCategorySlug(selectedSubSlug);
        setRoutines(data);
      } catch (err) {
        console.error(err);
        setRoutines([]);
      }
    };
    load();
  }, [selectedSubSlug]);

  const selectedSub = subCategories.find((s) => s.slug === selectedSubSlug);

  const stats = useMemo(() => {
    const active = routines.filter((r) => r.isActive).length;
    const subjects = new Set(routines.map((r) => r.subject)).size;
    return [
      {
        label: "মোট রুটিন",
        value: routines.length,
        icon: <Calendar className="size-4" />,
      },
      {
        label: "সক্রিয়",
        value: active,
        icon: <CheckCircle2 className="size-4" />,
      },
      {
        label: "বিষয়",
        value: subjects,
        icon: <BookOpen className="size-4" />,
      },
      {
        label: "গড় সময়",
        value: routines.length
          ? `${Math.round(routines.reduce((s, r) => s + r.duration, 0) / routines.length)} মি.`
          : "—",
        icon: <Clock className="size-4" />,
      },
    ];
  }, [routines]);

  const resetForm = () => {
    setForm({
      ...emptyForm,
      subExamCategoryId: selectedSub?.id ?? "",
    });
    setEditingId(null);
  };

  const reloadRoutines = async () => {
    if (!selectedSubSlug) return;
    const data = await routineService.getBySubCategorySlug(selectedSubSlug);
    setRoutines(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await routineService.update(editingId, {
          date: form.date,
          title: form.title,
          totalMarks: form.totalMarks,
          duration: form.duration,
          subject: form.subject,
          topics: form.topics,
          sourceMaterial: form.sourceMaterial,
          description: form.description,
        });
        toast.success("রুটিন সফলভাবে আপডেট হয়েছে");
      } else {
        await routineService.create({
          ...form,
          subExamCategoryId: selectedSub?.id ?? "",
        });
        toast.success("নতুন রুটিন সফলভাবে তৈরি হয়েছে");
      }
      setDialogOpen(false);
      resetForm();
      await reloadRoutines();
    } catch (err) {
      console.error(err);
      toast.error("অপারেশন ব্যর্থ হয়েছে");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (r: Routine) => {
    setForm({
      subExamCategoryId: r.subExamCategoryId,
      date: toInputDate(r.date),
      title: r.title,
      totalMarks: r.totalMarks,
      duration: r.duration,
      subject: r.subject,
      topics: r.topics ?? "",
      sourceMaterial: r.sourceMaterial ?? "",
      description: r.description ?? "",
    });
    setEditingId(r.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই রুটিন মুছে ফেলতে চান?")) return;
    try {
      await routineService.delete(id);
      toast.success("রুটিন মুছে ফেলা হয়েছে");
      await reloadRoutines();
    } catch (err) {
      console.error(err);
      toast.error("মুছে ফেলা ব্যর্থ হয়েছে");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-5 page-enter">
      <AdminPageHeader
        title="রুটিন ব্যবস্থাপনা"
        subtitle="পরীক্ষার রুটিন পরিচালনা করুন"
        icon={<Calendar className="size-5" />}
        count={routines.length}
        countLabel="টি রুটিন"
      >
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/routines/bulk-edit">
            <Table2 className="size-4 mr-1.5" />
            বাল্ক এডিট
          </Link>
        </Button>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" disabled={!selectedSub}>
              <Plus className="size-4 mr-1.5" />
              নতুন রুটিন
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "রুটিন সম্পাদনা" : "নতুন রুটিন তৈরি করুন"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">শিরোনাম</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="বাংলা সাহিত্য মডেল টেস্ট"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">তারিখ</Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subject">বিষয়</Label>
                  <Input
                    id="subject"
                    value={form.subject}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, subject: e.target.value }))
                    }
                    placeholder="বাংলা"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalMarks">মোট নম্বর</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    value={form.totalMarks}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        totalMarks: parseInt(e.target.value) || 0,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">সময় (মিনিট)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={form.duration}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        duration: parseInt(e.target.value) || 0,
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="topics">টপিক (ঐচ্ছিক)</Label>
                <Input
                  id="topics"
                  value={form.topics}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, topics: e.target.value }))
                  }
                  placeholder="কবিতা, গল্প, উপন্যাস"
                />
              </div>
              <div>
                <Label htmlFor="sourceMaterial">সোর্স (ঐচ্ছিক)</Label>
                <Input
                  id="sourceMaterial"
                  value={form.sourceMaterial}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sourceMaterial: e.target.value,
                    }))
                  }
                  placeholder="NCTB বোর্ড বই"
                />
              </div>
              <div>
                <Label htmlFor="description">বিবরণ (ঐচ্ছিক)</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="বিস্তারিত বিবরণ..."
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving
                  ? "সংরক্ষণ হচ্ছে..."
                  : editingId
                    ? "আপডেট করুন"
                    : "তৈরি করুন"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </AdminPageHeader>

      {/* Filter Bar */}
      <AdminFilterBar
        filters={[
          {
            id: "category",
            label: "ক্যাটাগরি",
            placeholder: "ক্যাটাগরি নির্বাচন",
            value: selectedCatId,
            onChange: setSelectedCatId,
            options: categories.map((cat) => ({
              value: cat.id,
              label: cat.name,
              icon: cat.icon || "📝",
            })),
          },
          {
            id: "sub-category",
            label: "সাব-ক্যাটাগরি",
            placeholder: "সাব-ক্যাটাগরি নির্বাচন",
            value: selectedSubSlug,
            onChange: setSelectedSubSlug,
            options: subCategories.map((sub) => ({
              value: sub.slug,
              label: sub.name,
            })),
          },
        ]}
      />

      {/* Stats */}
      {routines.length > 0 && <AdminStatsBar stats={stats} />}

      {/* Content */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={5} />
            </div>
          ) : !selectedSubSlug ? (
            <AdminEmptyState
              icon={<FolderOpen className="size-7" />}
              title="একটি সাব-ক্যাটাগরি নির্বাচন করুন"
              description="রুটিন দেখতে উপরের ফিল্টার থেকে একটি সাব-ক্যাটাগরি বেছে নিন"
            />
          ) : routines.length === 0 ? (
            <AdminEmptyState
              icon={<Calendar className="size-7" />}
              title="কোনো রুটিন নেই"
              description="এই সাব-ক্যাটাগরিতে এখনো কোনো রুটিন যোগ করা হয়নি"
              action={
                <Button
                  size="sm"
                  onClick={() => setDialogOpen(true)}
                  disabled={!selectedSub}
                >
                  <Plus className="size-4 mr-1.5" />
                  প্রথম রুটিন তৈরি করুন
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>শিরোনাম / টপিক</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>বিষয়</TableHead>
                    <TableHead className="text-center">নম্বর</TableHead>
                    <TableHead className="text-center">সময়</TableHead>
                    <TableHead className="text-center">স্ট্যাটাস</TableHead>
                    <TableHead className="text-right">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routines.map((r, index) => (
                    <TableRow
                      key={r.id}
                      className="group transition-colors hover:bg-primary/[0.02]"
                    >
                      <TableCell className="text-center text-muted-foreground text-xs tabular-nums">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm leading-tight">
                            {r.title || "শিরোনাম নেই"}
                          </span>
                          {r.topics && (
                            <span className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                              {r.topics}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(r.date)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="font-normal text-xs"
                        >
                          {r.subject}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center tabular-nums">
                        {r.totalMarks}
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground whitespace-nowrap">
                        {r.duration} মি.
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={r.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {r.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => handleEdit(r)}
                            title="সম্পাদনা"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(r.id)}
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
