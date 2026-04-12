"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import type {
  CreateQuestionInput,
  Question,
  QuestionSet,
} from "@/features/question-sets";
import { questionSetService } from "@/features/question-sets";
import {
  ArrowLeft,
  CheckCircle2,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

const OPTION_LABELS = ["ক", "খ", "গ", "ঘ"] as const;

const emptyForm: Omit<CreateQuestionInput, "questionSetId"> = {
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "A",
  explanation: "",
  subject: "",
  sortOrder: 0,
};

export default function AdminQuestionSetQuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: questionSetId } = use(params);

  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] =
    useState<Omit<CreateQuestionInput, "questionSetId">>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [qs, ql] = await Promise.all([
          questionSetService.getById(questionSetId),
          questionSetService.getQuestions(questionSetId),
        ]);
        setQuestionSet(qs);
        setQuestions(ql);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [questionSetId]);

  const resetForm = () => {
    setForm({
      ...emptyForm,
      sortOrder: questions.length + 1,
    });
    setEditingId(null);
    setPreviewMode(false);
  };

  const reloadQuestions = async () => {
    const data = await questionSetService.getQuestions(questionSetId);
    setQuestions(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await questionSetService.updateQuestion(editingId, {
          questionText: form.questionText,
          optionA: form.optionA,
          optionB: form.optionB,
          optionC: form.optionC,
          optionD: form.optionD,
          correctAnswer: form.correctAnswer,
          explanation: form.explanation || undefined,
          subject: form.subject || undefined,
          sortOrder: form.sortOrder,
        });
      } else {
        await questionSetService.createQuestion({
          questionSetId,
          ...form,
          explanation: form.explanation || undefined,
          subject: form.subject || undefined,
        });
      }
      setDialogOpen(false);
      resetForm();
      await reloadQuestions();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "সংরক্ষণ ব্যর্থ");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (q: Question) => {
    setForm({
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation ?? "",
      subject: q.subject ?? "",
      sortOrder: q.sortOrder,
    });
    setEditingId(q.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই প্রশ্ন মুছে ফেলতে চান?")) return;
    try {
      await questionSetService.deleteQuestion(id);
      await reloadQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  const correctAnswerLabel = (key: string) => {
    const idx = ["A", "B", "C", "D"].indexOf(key);
    return idx >= 0 ? OPTION_LABELS[idx] : key;
  };

  return (
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/question-sets">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold tracking-tight">
              প্রশ্ন ব্যবস্থাপনা
            </h1>
            {questionSet && (
              <p className="text-sm text-muted-foreground">
                {questionSet.title} — {questions.length} টি প্রশ্ন
              </p>
            )}
          </div>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={() => {
                  resetForm();
                  setDialogOpen(true);
                }}
              >
                <Plus className="size-4 mr-1" />
                প্রশ্ন যোগ করুন
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "প্রশ্ন সম্পাদনা" : "নতুন প্রশ্ন"}
                </DialogTitle>
              </DialogHeader>

              {!previewMode ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label>প্রশ্ন *</Label>
                      <Textarea
                        required
                        rows={3}
                        value={form.questionText}
                        onChange={(e) =>
                          setForm({ ...form, questionText: e.target.value })
                        }
                        placeholder="প্রশ্নের বিষয়বস্তু লিখুন..."
                      />
                    </div>

                    <div>
                      <Label>ক) অপশন A *</Label>
                      <Input
                        required
                        value={form.optionA}
                        onChange={(e) =>
                          setForm({ ...form, optionA: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>খ) অপশন B *</Label>
                      <Input
                        required
                        value={form.optionB}
                        onChange={(e) =>
                          setForm({ ...form, optionB: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>গ) অপশন C *</Label>
                      <Input
                        required
                        value={form.optionC}
                        onChange={(e) =>
                          setForm({ ...form, optionC: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>ঘ) অপশন D *</Label>
                      <Input
                        required
                        value={form.optionD}
                        onChange={(e) =>
                          setForm({ ...form, optionD: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label>সঠিক উত্তর *</Label>
                      <Select
                        value={form.correctAnswer}
                        onValueChange={(v) =>
                          setForm({ ...form, correctAnswer: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">ক) A</SelectItem>
                          <SelectItem value="B">খ) B</SelectItem>
                          <SelectItem value="C">গ) C</SelectItem>
                          <SelectItem value="D">ঘ) D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>বিষয়</Label>
                      <Input
                        value={form.subject}
                        onChange={(e) =>
                          setForm({ ...form, subject: e.target.value })
                        }
                        placeholder="বাংলা, ইংরেজি, গণিত..."
                      />
                    </div>

                    <div>
                      <Label>ক্রম নম্বর</Label>
                      <Input
                        type="number"
                        min={0}
                        value={form.sortOrder}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            sortOrder: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Label>ব্যাখ্যা</Label>
                      <Textarea
                        rows={4}
                        value={form.explanation}
                        onChange={(e) =>
                          setForm({ ...form, explanation: e.target.value })
                        }
                        placeholder="উত্তরের ব্যাখ্যা লিখুন..."
                      />
                    </div>
                  </div>

                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPreviewMode(true)}
                    >
                      প্রিভিউ
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving
                        ? "সংরক্ষণ হচ্ছে..."
                        : editingId
                          ? "আপডেট করুন"
                          : "সংরক্ষণ করুন"}
                    </Button>
                  </DialogFooter>
                </form>
              ) : (
                /* Preview Mode */
                <div className="space-y-4">
                  <Card>
                    <CardContent className="py-4">
                      <p className="text-lg whitespace-pre-wrap">
                        {form.questionText}
                      </p>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    {(["A", "B", "C", "D"] as const).map((key, i) => {
                      const optionText =
                        form[`option${key}` as keyof typeof form]?.toString() ??
                        "";
                      const isCorrect = form.correctAnswer === key;
                      return (
                        <div
                          key={key}
                          className={`flex items-center gap-3 rounded-lg border-2 p-3 ${
                            isCorrect
                              ? "border-green-400 bg-green-50"
                              : "border-gray-200"
                          }`}
                        >
                          <span
                            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                              isCorrect
                                ? "bg-green-500 text-white"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {OPTION_LABELS[i]}
                          </span>
                          <span>{optionText}</span>
                          {isCorrect && (
                            <CheckCircle2 className="size-4 text-green-500 ml-auto" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {form.explanation && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-blue-700">
                          ব্যাখ্যা
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="text-sm whitespace-pre-wrap">
                          {form.explanation}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      variant="outline"
                      onClick={() => setPreviewMode(false)}
                    >
                      সম্পাদনায় ফিরুন
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Question List */}
        {loading ? (
          <p className="text-center text-muted-foreground py-12">
            লোড হচ্ছে...
          </p>
        ) : questions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                কোনো প্রশ্ন নেই। উপরের বোতাম দিয়ে প্রশ্ন যোগ করুন।
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <Card
                key={q.id}
                className="transition-all hover:shadow-sm hover:border-primary/20"
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 pt-0.5">
                      <GripVertical className="size-4 text-gray-300" />
                      <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {q.sortOrder}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-snug line-clamp-2">
                        {q.questionText}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span>
                          সঠিক:{" "}
                          <span className="font-bold text-green-600">
                            {correctAnswerLabel(q.correctAnswer)}
                          </span>
                        </span>
                        {q.subject && (
                          <Badge variant="secondary" className="text-xs">
                            {q.subject}
                          </Badge>
                        )}
                        {q.explanation && (
                          <Badge
                            variant="outline"
                            className="text-xs text-blue-600 border-blue-200"
                          >
                            ব্যাখ্যা আছে
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        onClick={() => handleEdit(q)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(q.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
  );
}
