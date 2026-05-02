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
import type {
  CreateNotificationInput,
  Notification,
} from "@/features/notifications";
import { notificationService } from "@/features/notifications";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateNotificationInput>({
    title: "",
    content: "",
    type: "PUBLIC",
  });

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const resetForm = () => {
    setForm({ title: "", content: "", type: "PUBLIC" });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await notificationService.update(editingId, form);
      } else {
        await notificationService.create(form);
      }
      setDialogOpen(false);
      resetForm();
      await loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (n: Notification) => {
    setForm({
      title: n.title,
      content: n.content,
      type: n.type,
    });
    setEditingId(n.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই নোটিফিকেশন মুছে ফেলতে চান?")) return;
    try {
      await notificationService.delete(id);
      await loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            নোটিফিকেশন ব্যবস্থাপনা
          </h1>
          <p className="text-sm text-muted-foreground">
            {notifications.length} টি নোটিফিকেশন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/notifications/bulk-edit">বাল্ক এডিট</Link>
          </Button>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="size-4 mr-1" />
                নতুন নোটিফিকেশন
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "নোটিফিকেশন সম্পাদনা" : "নতুন নোটিফিকেশন"}
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
                    placeholder="নোটিফিকেশনের শিরোনাম"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="content">বিবরণ</Label>
                  <Textarea
                    id="content"
                    value={form.content}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, content: e.target.value }))
                    }
                    placeholder="নোটিফিকেশনের বিবরণ লিখুন"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">ধরন</Label>
                  <Select
                    value={form.type}
                    onValueChange={(val) =>
                      setForm((f) => ({
                        ...f,
                        type: val as "PUBLIC" | "SPECIFIC",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">সবার জন্য</SelectItem>
                      <SelectItem value="SPECIFIC">
                        নির্দিষ্ট ব্যবহারকারী
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  {editingId ? "আপডেট করুন" : "প্রকাশ করুন"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">সকল নোটিফিকেশন</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              লোড হচ্ছে...
            </p>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              কোনো নোটিফিকেশন নেই
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>শিরোনাম</TableHead>
                  <TableHead>ধরন</TableHead>
                  <TableHead>তারিখ</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{n.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {n.content}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {n.type === "PUBLIC" ? "সবার জন্য" : "নির্দিষ্ট"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(n.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={n.isActive ? "default" : "secondary"}>
                        {n.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(n)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(n.id)}
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
