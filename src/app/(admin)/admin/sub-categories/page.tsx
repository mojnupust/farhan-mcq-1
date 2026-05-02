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
  CreateSubExamCategoryInput,
  SubExamCategory,
} from "@/features/sub-exam-categories";
import { subExamCategoryService } from "@/features/sub-exam-categories";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

export default function AdminSubCategoriesPage() {
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [subCategories, setSubCategories] = useState<SubExamCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateSubExamCategoryInput>({
    examCategoryId: "",
    name: "",
    slug: "",
    description: "",
    sortOrder: 0,
  });

  // Load parent categories on mount
  useEffect(() => {
    const load = async () => {
      try {
        const cats = await examCategoryService.getAll();
        setCategories(cats);
        if (cats.length > 0) {
          setSelectedCategoryId(cats[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Load sub-categories when selected category changes
  useEffect(() => {
    if (!selectedCategoryId) return;
    const cat = categories.find((c) => c.id === selectedCategoryId);
    if (!cat) return;

    const loadSubs = async () => {
      try {
        const subs = await subExamCategoryService.getByCategorySlug(cat.slug);
        setSubCategories(subs);
      } catch (err) {
        console.error(err);
        setSubCategories([]);
      }
    };
    loadSubs();
  }, [selectedCategoryId, categories]);

  const resetForm = () => {
    setForm({
      examCategoryId: selectedCategoryId,
      name: "",
      slug: "",
      description: "",
      sortOrder: 0,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await subExamCategoryService.update(editingId, {
          name: form.name,
          slug: form.slug,
          description: form.description,
          sortOrder: form.sortOrder,
        });
      } else {
        await subExamCategoryService.create({
          ...form,
          examCategoryId: selectedCategoryId,
        });
      }
      setDialogOpen(false);
      resetForm();
      // Reload sub-categories
      const cat = categories.find((c) => c.id === selectedCategoryId);
      if (cat) {
        const subs = await subExamCategoryService.getByCategorySlug(cat.slug);
        setSubCategories(subs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (sub: SubExamCategory) => {
    setForm({
      examCategoryId: sub.examCategoryId,
      name: sub.name,
      slug: sub.slug,
      description: sub.description || "",
      sortOrder: sub.sortOrder,
    });
    setEditingId(sub.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই সাব-ক্যাটাগরি মুছে ফেলতে চান?")) return;
    try {
      await subExamCategoryService.delete(id);
      const cat = categories.find((c) => c.id === selectedCategoryId);
      if (cat) {
        const subs = await subExamCategoryService.getByCategorySlug(cat.slug);
        setSubCategories(subs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            সাব-ক্যাটাগরি ব্যবস্থাপনা
          </h1>
          <p className="text-sm text-muted-foreground">
            {subCategories.length} টি সাব-ক্যাটাগরি
            {selectedCategory ? ` — ${selectedCategory.name}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/sub-categories/bulk-edit">বাল্ক এডিট</Link>
          </Button>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" disabled={!selectedCategoryId}>
                <Plus className="size-4 mr-1" />
                নতুন সাব-ক্যাটাগরি
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "সাব-ক্যাটাগরি সম্পাদনা" : "নতুন সাব-ক্যাটাগরি"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">নাম</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setForm((f) => ({
                        ...f,
                        name,
                        slug: editingId ? f.slug : slugify(name),
                      }));
                    }}
                    placeholder="যেমন: প্রাইমারি জব সল্যুশন - রিভিশন"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">স্লাগ</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, slug: e.target.value }))
                    }
                    placeholder="primary-job-solution-revision"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">বিবরণ (ঐচ্ছিক)</Label>
                  <Input
                    id="description"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="সংক্ষিপ্ত বিবরণ"
                  />
                </div>
                <div>
                  <Label htmlFor="sortOrder">ক্রম</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        sortOrder: parseInt(e.target.value) || 0,
                      }))
                    }
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

      {/* Category Filter */}
      <div className="mt-4">
        <Label>প্যারেন্ট ক্যাটাগরি</Label>
        <Select
          value={selectedCategoryId}
          onValueChange={setSelectedCategoryId}
        >
          <SelectTrigger className="mt-1 w-full max-w-xs">
            <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
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

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">সাব-ক্যাটাগরি তালিকা</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              লোড হচ্ছে...
            </p>
          ) : subCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              কোনো সাব-ক্যাটাগরি নেই
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>নাম</TableHead>
                  <TableHead>স্লাগ</TableHead>
                  <TableHead>ক্রম</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subCategories.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {sub.slug}
                    </TableCell>
                    <TableCell>{sub.sortOrder}</TableCell>
                    <TableCell>
                      <Badge variant={sub.isActive ? "default" : "secondary"}>
                        {sub.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(sub)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(sub.id)}
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
