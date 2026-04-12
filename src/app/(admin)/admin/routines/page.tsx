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
import { Textarea } from "@/components/ui/textarea";
import type { ExamCategory } from "@/features/exam-categories";
import { examCategoryService } from "@/features/exam-categories";
import type { CreateRoutineInput, Routine } from "@/features/routines";
import { routineService } from "@/features/routines";
import type { SubExamCategory } from "@/features/sub-exam-categories";
import { subExamCategoryService } from "@/features/sub-exam-categories";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

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
      } else {
        await routineService.create({
          ...form,
          subExamCategoryId: selectedSub?.id ?? "",
        });
      }
      setDialogOpen(false);
      resetForm();
      await reloadRoutines();
    } catch (err) {
      console.error(err);
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
      await reloadRoutines();
    } catch (err) {
      console.error(err);
    }
  };

  return (
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              রুটিন ব্যবস্থাপনা
            </h1>
            <p className="text-sm text-muted-foreground">
              {routines.length} টি রুটিন
            </p>
          </div>

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
                নতুন রুটিন
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "রুটিন সম্পাদনা" : "নতুন রুটিন"}
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
                <Button type="submit" className="w-full">
                  {editingId ? "আপডেট করুন" : "তৈরি করুন"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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
            <CardTitle className="text-base">রুটিন তালিকা</CardTitle>
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
            ) : routines.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                কোনো রুটিন নেই
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
                  {routines.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium max-w-50 truncate">
                        {r.title}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(r.date)}
                      </TableCell>
                      <TableCell>{r.subject}</TableCell>
                      <TableCell>{r.totalMarks}</TableCell>
                      <TableCell>{r.duration} মি.</TableCell>
                      <TableCell>
                        <Badge variant={r.isActive ? "default" : "secondary"}>
                          {r.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(r)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(r.id)}
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
