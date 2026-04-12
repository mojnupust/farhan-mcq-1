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
import type { SubExamCategory } from "@/features/sub-exam-categories";
import { subExamCategoryService } from "@/features/sub-exam-categories";
import type { CreateSyllabusInput, Syllabus } from "@/features/syllabus";
import { syllabusService } from "@/features/syllabus";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

// ─── MDX Content Renderer ────────────────────────────────────────────
function renderMdx(content: string): string {
  let html = content;

  // YouTube embeds
  html = html.replace(
    /!\[youtube\]\((https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)[^)]*)\)/gi,
    (_m, _u, id) =>
      `<div class="my-4 aspect-video"><iframe src="https://www.youtube.com/embed/${id}" class="w-full h-full rounded-lg" frameborder="0" allowfullscreen></iframe></div>`,
  );
  html = html.replace(
    /\{\{youtube:(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)[^}]*)\}\}/gi,
    (_m, _u, id) =>
      `<div class="my-4 aspect-video"><iframe src="https://www.youtube.com/embed/${id}" class="w-full h-full rounded-lg" frameborder="0" allowfullscreen></iframe></div>`,
  );

  // Images
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="my-4 max-w-full rounded-lg" />',
  );
  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>',
  );
  // Headings
  html = html.replace(
    /^### (.+)$/gm,
    '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>',
  );
  html = html.replace(
    /^## (.+)$/gm,
    '<h2 class="text-xl font-semibold mt-8 mb-3">$1</h2>',
  );
  html = html.replace(
    /^# (.+)$/gm,
    '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>',
  );
  // Bold / Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(
    /^\d+\. (.+)$/gm,
    '<li class="ml-4 list-decimal">$1</li>',
  );
  html = html.replace(
    /(<li class="ml-4 list-disc">[^]*?<\/li>(\n|$))+/g,
    (m) => `<ul class="my-2 space-y-1">${m}</ul>`,
  );
  html = html.replace(
    /(<li class="ml-4 list-decimal">[^]*?<\/li>(\n|$))+/g,
    (m) => `<ol class="my-2 space-y-1">${m}</ol>`,
  );
  // Paragraphs
  html = html
    .split("\n")
    .map((line) => {
      const t = line.trim();
      if (!t) return "";
      if (/^<(h[1-6]|ul|ol|li|div|img|a|\/)/i.test(t)) return line;
      return `<p class="my-2">${t}</p>`;
    })
    .join("\n");
  return html;
}

// ─── MDX Editor Component ────────────────────────────────────────────
function MdxEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const insertAtCursor = useCallback(
    (before: string, after: string = "") => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const selected = value.substring(start, end);
      const newText =
        value.substring(0, start) +
        before +
        selected +
        after +
        value.substring(end);
      onChange(newText);
      // Re-focus after state update
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(
          start + before.length,
          start + before.length + selected.length,
        );
      });
    },
    [value, onChange],
  );

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border rounded-lg p-1.5 bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => insertAtCursor("# ", "\n")}
          title="Heading 1"
        >
          H1
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => insertAtCursor("## ", "\n")}
          title="Heading 2"
        >
          H2
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => insertAtCursor("### ", "\n")}
          title="Heading 3"
        >
          H3
        </Button>
        <div className="w-px bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs font-bold"
          onClick={() => insertAtCursor("**", "**")}
          title="Bold"
        >
          B
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs italic"
          onClick={() => insertAtCursor("*", "*")}
          title="Italic"
        >
          I
        </Button>
        <div className="w-px bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => insertAtCursor("- ", "\n")}
          title="Bullet List"
        >
          • List
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => insertAtCursor("1. ", "\n")}
          title="Numbered List"
        >
          1. List
        </Button>
        <div className="w-px bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => insertAtCursor("[", "](url)")}
          title="Link"
        >
          🔗
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => insertAtCursor("![alt](", ")")}
          title="Image"
        >
          🖼️
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => insertAtCursor("![youtube](https://youtu.be/", ")")}
          title="YouTube Video"
        >
          ▶️ YT
        </Button>
        <div className="ml-auto">
          <Button
            type="button"
            variant={showPreview ? "default" : "outline"}
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? "এডিটর" : "প্রিভিউ"}
          </Button>
        </div>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <Card>
          <CardContent className="py-4 prose prose-sm max-w-none min-h-75">
            <div dangerouslySetInnerHTML={{ __html: renderMdx(value) }} />
          </CardContent>
        </Card>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-75 rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="এখানে MDX কন্টেন্ট লিখুন...\n\n# শিরোনাম\n## উপ-শিরোনাম\n\n- বুলেট আইটেম\n1. নম্বরযুক্ত আইটেম\n\n**বোল্ড**, *ইটালিক*\n\n[লিংক](url)\n![ইমেজ](url)\n![youtube](https://youtu.be/VIDEO_ID)"
        />
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────
const emptyForm: CreateSyllabusInput = {
  subExamCategoryId: "",
  title: "",
  slug: "",
  content: "",
  sortOrder: 0,
};

export default function AdminSyllabusPage() {
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [selectedCatId, setSelectedCatId] = useState("");
  const [subCategories, setSubCategories] = useState<SubExamCategory[]>([]);
  const [selectedSubSlug, setSelectedSubSlug] = useState("");
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateSyllabusInput>(emptyForm);

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

  // Load syllabuses when sub-category changes
  useEffect(() => {
    if (!selectedSubSlug) {
      setSyllabuses([]);
      return;
    }
    const load = async () => {
      try {
        const data =
          await syllabusService.getBySubCategorySlug(selectedSubSlug);
        setSyllabuses(data);
      } catch (err) {
        console.error(err);
        setSyllabuses([]);
      }
    };
    load();
  }, [selectedSubSlug]);

  const selectedSub = subCategories.find((s) => s.slug === selectedSubSlug);

  const resetForm = () => {
    setForm({ ...emptyForm, subExamCategoryId: selectedSub?.id ?? "" });
    setEditingId(null);
  };

  const reloadSyllabuses = async () => {
    if (!selectedSubSlug) return;
    const data = await syllabusService.getBySubCategorySlug(selectedSubSlug);
    setSyllabuses(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await syllabusService.update(editingId, {
          title: form.title,
          slug: form.slug,
          content: form.content,
          sortOrder: form.sortOrder,
        });
      } else {
        await syllabusService.create({
          ...form,
          subExamCategoryId: selectedSub?.id ?? "",
        });
      }
      setDialogOpen(false);
      resetForm();
      await reloadSyllabuses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (s: Syllabus) => {
    setForm({
      subExamCategoryId: s.subExamCategoryId,
      title: s.title,
      slug: s.slug,
      content: s.content,
      sortOrder: s.sortOrder,
    });
    setEditingId(s.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই সিলেবাস মুছে ফেলতে চান?")) return;
    try {
      await syllabusService.delete(id);
      await reloadSyllabuses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              সিলেবাস ব্যবস্থাপনা
            </h1>
            <p className="text-sm text-muted-foreground">
              {syllabuses.length} টি সিলেবাস
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
                নতুন সিলেবাস
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "সিলেবাস সম্পাদনা" : "নতুন সিলেবাস"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">শিরোনাম</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setForm((f) => ({
                        ...f,
                        title,
                        slug: editingId ? f.slug : slugify(title),
                      }));
                    }}
                    placeholder="প্রাথমিক শিক্ষক নিয়োগ সিলেবাস"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="slug">স্লাগ</Label>
                    <Input
                      id="slug"
                      value={form.slug}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, slug: e.target.value }))
                      }
                      placeholder="primary-shikkok-niyog"
                      required
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
                </div>
                <div>
                  <Label>কন্টেন্ট (MDX)</Label>
                  <MdxEditor
                    value={form.content}
                    onChange={(content) => setForm((f) => ({ ...f, content }))}
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
            <CardTitle className="text-base">সিলেবাস তালিকা</CardTitle>
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
            ) : syllabuses.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                কোনো সিলেবাস নেই
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>শিরোনাম</TableHead>
                    <TableHead>স্লাগ</TableHead>
                    <TableHead>ক্রম</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead className="text-right">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syllabuses.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.title}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {s.slug}
                      </TableCell>
                      <TableCell>{s.sortOrder}</TableCell>
                      <TableCell>
                        <Badge variant={s.isActive ? "default" : "secondary"}>
                          {s.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(s)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(s.id)}
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
