"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  FileText,
  Lock,
  Pencil,
  Plus,
  Trash2,
  Unlock,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
      await reloadSets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await questionSetService.toggleStatus(id);
      await reloadSets();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "স্ট্যাটাস পরিবর্তন ব্যর্থ");
    }
  };

  const handleToggleFree = async (id: string) => {
    try {
      await questionSetService.toggleFree(id);
      await reloadSets();
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error ? err.message : "ফ্রি স্ট্যাটাস পরিবর্তন ব্যর্থ",
      );
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            প্রশ্নসেট ব্যবস্থাপনা
          </h1>
          <p className="text-sm text-muted-foreground">
            {sets.length} টি প্রশ্নসেট
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/question-sets/bulk-edit">বাল্ক এডিট</Link>
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
                <Plus className="size-4 mr-1" />
                নতুন প্রশ্নসেট
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "প্রশ্নসেট সম্পাদনা" : "নতুন প্রশ্নসেট"}
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
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 flex gap-4">
        <div className="flex-1 max-w-xs">
          <Label>ক্যাটাগরি</Label>
          <Select value={selectedCatId} onValueChange={setSelectedCatId}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="ক্যাটাগরি নির্বাচন" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon || "📝"} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 max-w-xs">
          <Label>সাব-ক্যাটাগরি</Label>
          <Select value={selectedSubSlug} onValueChange={setSelectedSubSlug}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="সাব-ক্যাটাগরি নির্বাচন" />
            </SelectTrigger>
            <SelectContent>
              {subCategories.map((sub) => (
                <SelectItem key={sub.id} value={sub.slug}>
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">প্রশ্নসেট তালিকা</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              লোড হচ্ছে...
            </p>
          ) : !selectedSubSlug ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              একটি সাব-ক্যাটাগরি নির্বাচন করুন
            </p>
          ) : sets.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              কোনো প্রশ্নসেট নেই
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>শিরোনাম</TableHead>
                  <TableHead>তারিখ</TableHead>
                  <TableHead>বিষয়</TableHead>
                  <TableHead>নম্বর</TableHead>
                  <TableHead>সময়</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sets.map((qs) => (
                  <TableRow key={qs.id}>
                    <TableCell className="font-medium max-w-50 truncate">
                      {qs.title}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(qs.date)}
                    </TableCell>
                    <TableCell>{qs.subject}</TableCell>
                    <TableCell>{qs.totalMarks}</TableCell>
                    <TableCell>{qs.duration} মি.</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge
                          variant={qs.isLive ? "default" : "secondary"}
                          className={qs.isLive ? "bg-green-600" : ""}
                        >
                          {qs.isLive ? "লাইভ" : "আর্কাইভ"}
                        </Badge>
                        {qs.isFree && (
                          <Badge
                            variant="outline"
                            className="text-blue-600 border-blue-300"
                          >
                            ফ্রি
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="প্রশ্ন"
                          asChild
                        >
                          <Link
                            href={`/admin/question-sets/${qs.id}/questions`}
                          >
                            <FileText className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={qs.isFree ? "পেইড করুন" : "ফ্রি করুন"}
                          onClick={() => handleToggleFree(qs.id)}
                        >
                          {qs.isFree ? (
                            <Unlock className="size-4 text-blue-500" />
                          ) : (
                            <Lock className="size-4 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={qs.isLive ? "আর্কাইভ করুন" : "লাইভ করুন"}
                          onClick={() => handleToggleStatus(qs.id)}
                        >
                          <ArrowUpDown className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(qs)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(qs.id)}
                        >
                          <Trash2 className="size-4 text-destructive" />
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
    </div>
  );
}
