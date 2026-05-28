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
import type { ExamCategory } from "@/features/exam-categories";
import { examCategoryService } from "@/features/exam-categories";
import type {
  CreateQuestionSetInput,
  QuestionSet,
} from "@/features/question-sets";
import { questionSetService } from "@/features/question-sets";
import type { SubExamCategory } from "@/features/sub-exam-categories";
import { subExamCategoryService } from "@/features/sub-exam-categories";
import {
  ArrowUpDown,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderOpen,
  Lock,
  Pencil,
  Plus,
  Radio,
  Table2,
  Trash2,
  Unlock,
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
  return new Date(dateStr).toISOString().split("T")[0]!;
}

const emptyForm: CreateQuestionSetInput = {
  subExamCategoryId: "",
  title: "",
  date: new Date().toISOString().split("T")[0]!,
  totalMarks: 80,
  duration: 60,
  subject: "",
  topics: "",
  sourceMaterial: "",
  markPerQuestion: 1,
  negativeMark: 0.25,
  isLive: false,
};

export default function AdminQuestionSetsPage() {
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [selectedCatId, setSelectedCatId] = useState("");
  const [subCategories, setSubCategories] = useState<SubExamCategory[]>([]);
  const [selectedSubSlug, setSelectedSubSlug] = useState("");
  const [sets, setSets] = useState<QuestionSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateQuestionSetInput>(emptyForm);

  // Load categories
  useEffect(() => {
    const load = async () => {
      try {
        const cats = await examCategoryService.getAll();
        setCategories(cats);
        if (cats.length > 0) setSelectedCatId(cats[0]!.id);
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
        if (subs.length > 0) setSelectedSubSlug(subs[0]!.slug);
        else setSelectedSubSlug("");
      } catch (err) {
        console.error(err);
        setSubCategories([]);
      }
    };
    load();
  }, [selectedCatId, categories]);

  // Load question sets when sub-category changes
  useEffect(() => {
    if (!selectedSubSlug) {
      setSets([]);
      return;
    }
    const load = async () => {
      try {
        const data =
          await questionSetService.getAllBySubCategorySlug(selectedSubSlug);
        setSets(data);
      } catch (err) {
        console.error(err);
        setSets([]);
      }
    };
    load();
  }, [selectedSubSlug]);

  const selectedSub = subCategories.find((s) => s.slug === selectedSubSlug);

  const resetForm = () => {
    setForm({
      ...emptyForm,
      subExamCategoryId: selectedSub?.id ?? "",
    });
    setEditingId(null);
  };

  const reloadSets = async () => {
    if (!selectedSubSlug) return;
    const data =
      await questionSetService.getAllBySubCategorySlug(selectedSubSlug);
    setSets(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await questionSetService.update(editingId, {
          title: form.title,
          date: form.date,
          totalMarks: form.totalMarks,
          duration: form.duration,
          subject: form.subject,
          topics: form.topics,
          sourceMaterial: form.sourceMaterial,
          markPerQuestion: form.markPerQuestion,
          negativeMark: form.negativeMark,
        });
      } else {
        await questionSetService.create({
          ...form,
          subExamCategoryId: selectedSub?.id ?? "",
        });
      }
      setDialogOpen(false);
      resetForm();
      await reloadSets();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "অপারেশন ব্যর্থ হয়েছে");
    }
  };

  const handleEdit = (qs: QuestionSet) => {
    setForm({
      subExamCategoryId: qs.subExamCategoryId,
      title: qs.title,
      date: toInputDate(qs.date),
      totalMarks: qs.totalMarks,
      duration: qs.duration,
      subject: qs.subject,
      topics: qs.topics ?? "",
      sourceMaterial: qs.sourceMaterial ?? "",
      markPerQuestion: qs.markPerQuestion,
      negativeMark: qs.negativeMark,
      isLive: qs.isLive,
    });
    setEditingId(qs.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই প্রশ্নসেট মুছে ফেলতে চান?")) return;
    try {
      await questionSetService.delete(id);
      toast.success("প্রশ্নসেট মুছে ফেলা হয়েছে");
      await reloadSets();
    } catch (err) {
      console.error(err);
      toast.error("মুছে ফেলা ব্যর্থ হয়েছে");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await questionSetService.toggleStatus(id);
      toast.success("স্ট্যাটাস পরিবর্তন হয়েছে");
      await reloadSets();
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "স্ট্যাটাস পরিবর্তন ব্যর্থ",
      );
    }
  };

  const handleToggleFree = async (id: string) => {
    try {
      await questionSetService.toggleFree(id);
      toast.success("ফ্রি স্ট্যাটাস পরিবর্তন হয়েছে");
      await reloadSets();
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "ফ্রি স্ট্যাটাস পরিবর্তন ব্যর্থ",
      );
    }
  };

  const stats = useMemo(() => {
    const live = sets.filter((s) => s.isLive).length;
    const free = sets.filter((s) => s.isFree).length;
    return [
      {
        label: "মোট প্রশ্নসেট",
        value: sets.length,
        icon: <ClipboardList className="size-4" />,
      },
      {
        label: "লাইভ",
        value: live,
        icon: <Radio className="size-4" />,
      },
      {
        label: "ফ্রি",
        value: free,
        icon: <Unlock className="size-4" />,
      },
      {
        label: "আর্কাইভ",
        value: sets.length - live,
        icon: <CheckCircle2 className="size-4" />,
      },
    ];
  }, [sets]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-5 page-enter">
      <AdminPageHeader
        title="প্রশ্নসেট ব্যবস্থাপনা"
        subtitle="প্রশ্নসেট তৈরি ও পরিচালনা করুন"
        icon={<ClipboardList className="size-5" />}
        count={sets.length}
        countLabel="টি প্রশ্নসেট"
      >
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/question-sets/bulk-edit">
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
              নতুন প্রশ্নসেট
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "প্রশ্নসেট সম্পাদনা" : "নতুন প্রশ্নসেট তৈরি করুন"}
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
                  placeholder="মডেল টেস্ট ০১"
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
                    placeholder="সকল বিষয়"
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
                        totalMarks: parseFloat(e.target.value) || 0,
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="markPerQuestion">প্রতি প্রশ্নে নম্বর</Label>
                  <Input
                    id="markPerQuestion"
                    type="number"
                    step="0.1"
                    value={form.markPerQuestion}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        markPerQuestion: parseFloat(e.target.value) || 1,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="negativeMark">নেগেটিভ মার্ক</Label>
                  <Input
                    id="negativeMark"
                    type="number"
                    step="0.05"
                    value={form.negativeMark}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        negativeMark: parseFloat(e.target.value) || 0,
                      }))
                    }
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
                  placeholder="বাংলা, ইংরেজি, গণিত"
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
              <Button type="submit" className="w-full">
                {editingId ? "আপডেট করুন" : "তৈরি করুন"}
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
      {sets.length > 0 && <AdminStatsBar stats={stats} />}

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
              description="প্রশ্নসেট দেখতে উপরের ফিল্টার থেকে একটি সাব-ক্যাটাগরি বেছে নিন"
            />
          ) : sets.length === 0 ? (
            <AdminEmptyState
              icon={<ClipboardList className="size-7" />}
              title="কোনো প্রশ্নসেট নেই"
              description="এই সাব-ক্যাটাগরিতে এখনো কোনো প্রশ্নসেট যোগ করা হয়নি"
              action={
                <Button
                  size="sm"
                  onClick={() => setDialogOpen(true)}
                  disabled={!selectedSub}
                >
                  <Plus className="size-4 mr-1.5" />
                  প্রথম প্রশ্নসেট তৈরি করুন
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead>শিরোনাম</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>বিষয়</TableHead>
                    <TableHead className="text-center">নম্বর</TableHead>
                    <TableHead className="text-center">সময়</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead className="text-right">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sets.map((qs) => (
                    <TableRow
                      key={qs.id}
                      className="group transition-colors hover:bg-primary/[0.02]"
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm leading-tight max-w-[200px] truncate">
                            {qs.title}
                          </span>
                          {qs.topics && (
                            <span className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                              {qs.topics}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(qs.date)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal text-xs">
                          {qs.subject}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center tabular-nums">
                        {qs.totalMarks}
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground whitespace-nowrap">
                        {qs.duration} মি.
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1.5">
                          <Badge
                            variant={qs.isLive ? "default" : "secondary"}
                            className={
                              qs.isLive
                                ? "bg-emerald-500/15 text-emerald-700 border-emerald-200"
                                : ""
                            }
                          >
                            {qs.isLive ? "লাইভ" : "আর্কাইভ"}
                          </Badge>
                          {qs.isFree && (
                            <Badge
                              variant="outline"
                              className="text-blue-600 border-blue-200 bg-blue-50/50"
                            >
                              ফ্রি
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            title="প্রশ্ন দেখুন"
                            asChild
                          >
                            <Link
                              href={`/admin/question-sets/${qs.id}/questions`}
                            >
                              <FileText className="size-3.5" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            title={qs.isFree ? "পেইড করুন" : "ফ্রি করুন"}
                            onClick={() => handleToggleFree(qs.id)}
                          >
                            {qs.isFree ? (
                              <Unlock className="size-3.5 text-blue-500" />
                            ) : (
                              <Lock className="size-3.5 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            title={qs.isLive ? "আর্কাইভ করুন" : "লাইভ করুন"}
                            onClick={() => handleToggleStatus(qs.id)}
                          >
                            <ArrowUpDown className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => handleEdit(qs)}
                            title="সম্পাদনা"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(qs.id)}
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
