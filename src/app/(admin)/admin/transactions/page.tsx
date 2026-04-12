"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { subscriptionService } from "@/features/subscriptions";
import type { PaymentTransactionDto } from "@/features/subscriptions/types";
import { CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return <Badge variant="outline">পেন্ডিং</Badge>;
    case "APPROVED":
      return <Badge variant="default">অনুমোদিত</Badge>;
    case "REJECTED":
      return <Badge variant="destructive">প্রত্যাখ্যাত</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function methodLabel(method: string) {
  switch (method) {
    case "BKASH":
      return "বিকাশ";
    case "NAGAD":
      return "নগদ";
    case "ROCKET":
      return "রকেট";
    default:
      return method;
  }
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<PaymentTransactionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Review dialog
  const [reviewTxn, setReviewTxn] = useState<PaymentTransactionDto | null>(
    null,
  );
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">(
    "approve",
  );
  const [adminNote, setAdminNote] = useState("");
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [filterStatus]);

  const loadTransactions = async () => {
    try {
      const statusParam = filterStatus === "all" ? undefined : filterStatus;
      const data = await subscriptionService.getAllTransactions(statusParam);
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openReview = (
    txn: PaymentTransactionDto,
    action: "approve" | "reject",
  ) => {
    setReviewTxn(txn);
    setReviewAction(action);
    setAdminNote("");
  };

  const handleReview = async () => {
    if (!reviewTxn) return;
    setReviewing(true);
    try {
      if (reviewAction === "approve") {
        await subscriptionService.approveTransaction(reviewTxn.id, {
          adminNote: adminNote || undefined,
        });
      } else {
        await subscriptionService.rejectTransaction(reviewTxn.id, {
          adminNote: adminNote || undefined,
        });
      }
      setReviewTxn(null);
      await loadTransactions();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "অপারেশন ব্যর্থ হয়েছে");
    } finally {
      setReviewing(false);
    }
  };

  const filtered = transactions.filter((txn) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      txn.transactionId.toLowerCase().includes(q) ||
      txn.userName?.toLowerCase().includes(q) ||
      txn.userMobile?.toLowerCase().includes(q) ||
      txn.mobileNumber.toLowerCase().includes(q)
    );
  });

  const pendingCount = transactions.filter(
    (t) => t.status === "PENDING",
  ).length;

  return (
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            ট্রানজাকশন ব্যবস্থাপনা
          </h1>
          <p className="text-sm text-muted-foreground">
            মোট {transactions.length} টি ট্রানজাকশন · {pendingCount} টি পেন্ডিং
          </p>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">সকল ট্রানজাকশন</CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="খুঁজুন (TXN ID, নাম, মোবাইল)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[220px]"
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সকল</SelectItem>
                    <SelectItem value="PENDING">পেন্ডিং</SelectItem>
                    <SelectItem value="APPROVED">অনুমোদিত</SelectItem>
                    <SelectItem value="REJECTED">প্রত্যাখ্যাত</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="py-8 text-center text-muted-foreground">
                লোড হচ্ছে...
              </p>
            ) : filtered.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                কোনো ট্রানজাকশন নেই
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ব্যবহারকারী</TableHead>
                      <TableHead>প্যাকেজ</TableHead>
                      <TableHead>ট্রানজাকশন</TableHead>
                      <TableHead>পেমেন্ট</TableHead>
                      <TableHead>পরিমাণ</TableHead>
                      <TableHead>স্ট্যাটাস</TableHead>
                      <TableHead>তারিখ</TableHead>
                      <TableHead className="text-right">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">
                              {txn.userName ?? "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {txn.userMobile}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {txn.packageName}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-mono text-xs">
                              {txn.transactionId}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {txn.mobileNumber}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {methodLabel(txn.paymentMethod)}
                        </TableCell>
                        <TableCell className="font-medium">
                          ৳{txn.amount}
                        </TableCell>
                        <TableCell>{statusBadge(txn.status)}</TableCell>
                        <TableCell className="text-xs">
                          {formatDate(txn.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          {txn.status === "PENDING" ? (
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => openReview(txn, "approve")}
                              >
                                <CheckCircle className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => openReview(txn, "reject")}
                              >
                                <XCircle className="size-4" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {txn.adminNote && `নোট: ${txn.adminNote}`}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog
          open={reviewTxn !== null}
          onOpenChange={(open) => {
            if (!open) setReviewTxn(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewAction === "approve"
                  ? "ট্রানজাকশন অনুমোদন"
                  : "ট্রানজাকশন প্রত্যাখ্যান"}
              </DialogTitle>
            </DialogHeader>
            {reviewTxn && (
              <div className="space-y-4">
                <div className="rounded border p-3 text-sm space-y-1">
                  <p>
                    <strong>ব্যবহারকারী:</strong> {reviewTxn.userName} (
                    {reviewTxn.userMobile})
                  </p>
                  <p>
                    <strong>TXN ID:</strong> {reviewTxn.transactionId}
                  </p>
                  <p>
                    <strong>পেমেন্ট:</strong>{" "}
                    {methodLabel(reviewTxn.paymentMethod)} — ৳{reviewTxn.amount}
                  </p>
                  <p>
                    <strong>প্যাকেজ:</strong> {reviewTxn.packageName}
                  </p>
                  <p>
                    <strong>মোবাইল নম্বর:</strong> {reviewTxn.mobileNumber}
                  </p>
                </div>
                <div>
                  <Label htmlFor="adminNote">অ্যাডমিন নোট (ঐচ্ছিক)</Label>
                  <Textarea
                    id="adminNote"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="নোট লিখুন..."
                    className="min-h-[60px] resize-none"
                  />
                </div>
                <Button
                  onClick={handleReview}
                  disabled={reviewing}
                  variant={
                    reviewAction === "approve" ? "default" : "destructive"
                  }
                  className="w-full"
                >
                  {reviewing
                    ? "প্রসেসিং..."
                    : reviewAction === "approve"
                      ? "অনুমোদন করুন"
                      : "প্রত্যাখ্যান করুন"}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  );
}
