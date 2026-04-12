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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { subscriptionService } from "@/features/subscriptions";
import type {
  CreatePackageInput,
  PackageDto,
} from "@/features/subscriptions/types";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const emptyForm: CreatePackageInput = {
  name: "",
  durationDays: 365,
  price: 0,
  discount: 0,
  description: "",
  sortOrder: 0,
};

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreatePackageInput>(emptyForm);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const data = await subscriptionService.getAdminPackages();
      setPackages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await subscriptionService.updatePackage(editingId, {
          name: form.name,
          durationDays: form.durationDays,
          price: form.price,
          discount: form.discount,
          description: form.description,
          liveQuota: form.liveQuota,
          archiveQuota: form.archiveQuota,
          sortOrder: form.sortOrder,
        });
      } else {
        await subscriptionService.createPackage(form);
      }
      setDialogOpen(false);
      resetForm();
      await loadPackages();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "অপারেশন ব্যর্থ হয়েছে");
    }
  };

  const handleEdit = (pkg: PackageDto) => {
    setForm({
      name: pkg.name,
      durationDays: pkg.durationDays,
      price: pkg.price,
      discount: pkg.discount,
      description: pkg.description ?? "",
      liveQuota: pkg.liveQuota ?? undefined,
      archiveQuota: pkg.archiveQuota ?? undefined,
      sortOrder: pkg.sortOrder,
    });
    setEditingId(pkg.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("এই প্যাকেজ মুছে ফেলতে চান?")) return;
    try {
      await subscriptionService.deletePackage(id);
      await loadPackages();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "মুছে ফেলা ব্যর্থ হয়েছে");
    }
  };

  const handleToggleActive = async (pkg: PackageDto) => {
    try {
      await subscriptionService.updatePackage(pkg.id, {
        isActive: !pkg.isActive,
      });
      await loadPackages();
    } catch (err) {
      console.error(err);
    }
  };

  return (
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              প্যাকেজ ব্যবস্থাপনা
            </h1>
            <p className="text-sm text-muted-foreground">
              {packages.length} টি প্যাকেজ
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
              <Button size="sm">
                <Plus className="size-4 mr-1" />
                নতুন প্যাকেজ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "প্যাকেজ সম্পাদনা" : "নতুন প্যাকেজ"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">প্যাকেজ নাম</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="১ বছর প্যাকেজ"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="durationDays">মেয়াদ (দিন)</Label>
                    <Input
                      id="durationDays"
                      type="number"
                      value={form.durationDays}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          durationDays: Number(e.target.value),
                        }))
                      }
                      min={1}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">মূল্য (৳)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          price: Number(e.target.value),
                        }))
                      }
                      min={0}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discount">ছাড় (৳)</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={form.discount ?? 0}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          discount: Number(e.target.value),
                        }))
                      }
                      min={0}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sortOrder">ক্রম</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={form.sortOrder ?? 0}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          sortOrder: Number(e.target.value),
                        }))
                      }
                      min={0}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="liveQuota">লাইভ কোটা (ঐচ্ছিক)</Label>
                    <Input
                      id="liveQuota"
                      type="number"
                      value={form.liveQuota ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          liveQuota: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        }))
                      }
                      min={1}
                      placeholder="সীমাহীন"
                    />
                  </div>
                  <div>
                    <Label htmlFor="archiveQuota">আর্কাইভ কোটা (ঐচ্ছিক)</Label>
                    <Input
                      id="archiveQuota"
                      type="number"
                      value={form.archiveQuota ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          archiveQuota: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        }))
                      }
                      min={1}
                      placeholder="সীমাহীন"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">বিবরণ</Label>
                  <Textarea
                    id="description"
                    value={form.description ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="প্যাকেজের বিবরণ..."
                    className="min-h-[60px] resize-none"
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingId ? "আপডেট করুন" : "তৈরি করুন"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">সকল প্যাকেজ</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="py-8 text-center text-muted-foreground">
                লোড হচ্ছে...
              </p>
            ) : packages.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                কোনো প্যাকেজ নেই
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>নাম</TableHead>
                    <TableHead>মেয়াদ</TableHead>
                    <TableHead>মূল্য</TableHead>
                    <TableHead>ছাড়</TableHead>
                    <TableHead>কোটা</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead className="text-right">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-medium">{pkg.name}</TableCell>
                      <TableCell>{pkg.durationDays} দিন</TableCell>
                      <TableCell>৳{pkg.price}</TableCell>
                      <TableCell>৳{pkg.discount}</TableCell>
                      <TableCell>
                        {pkg.liveQuota || pkg.archiveQuota ? (
                          <span className="text-xs">
                            L:{pkg.liveQuota ?? "∞"} A:
                            {pkg.archiveQuota ?? "∞"}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            সীমাহীন
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={pkg.isActive ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => handleToggleActive(pkg)}
                        >
                          {pkg.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(pkg)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(pkg.id)}
                          >
                            <Trash2 className="size-4 text-red-500" />
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
