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
import { TableSkeleton } from "@/components/ui/loading-skeleton";
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
import { formatBdt } from "@/features/wallet";
import {
  METHOD_BN,
  STATUS_BN,
  withdrawalService,
  type WithdrawalRequest,
  type WithdrawalStatus,
} from "@/features/withdrawal";
import { CheckCircle, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type FilterStatus = "all" | WithdrawalStatus;
type ReviewAction = "approve" | "reject" | "pay";

function statusBadge(status: WithdrawalStatus) {
  if (status === "REJECTED")
    return <Badge variant="destructive">{STATUS_BN[status]}</Badge>;
  if (status === "REQUESTED")
    return <Badge variant="outline">{STATUS_BN[status]}</Badge>;
  return <Badge>{STATUS_BN[status]}</Badge>;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminWithdrawalsPage() {
  const [rows, setRows] = useState<WithdrawalRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [review, setReview] = useState<WithdrawalRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<ReviewAction>("approve");
  const [adminNote, setAdminNote] = useState("");
  const [paidTrxId, setPaidTrxId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await withdrawalService.listAdmin(filterStatus);
      setRows(data.data);
      setTotal(data.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "লোড হয়নি");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  function openReview(row: WithdrawalRequest, action: ReviewAction) {
    setReview(row);
    setReviewAction(action);
    setAdminNote("");
    setPaidTrxId("");
  }

  async function handleReview() {
    if (!review) return;
    if (reviewAction === "pay" && paidTrxId.trim().length < 4) {
      toast.error("পেমেন্ট Txn ID দিন");
      return;
    }
    setSubmitting(true);
    try {
      if (reviewAction === "approve") {
        await withdrawalService.approve(review.id, adminNote || undefined);
      } else if (reviewAction === "reject") {
        await withdrawalService.reject(review.id, adminNote || undefined);
      } else {
        await withdrawalService.pay(
          review.id,
          paidTrxId.trim(),
          adminNote || undefined,
        );
      }
      setReview(null);
      await load();
      toast.success("আপডেট হয়েছে");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "অপারেশন ব্যর্থ");
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = rows.filter((row) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      row.destinationNumber.includes(q) ||
      row.user?.mobile?.includes(q) ||
      (row.user?.name ?? "").toLowerCase().includes(q) ||
      (row.paidTrxId ?? "").toLowerCase().includes(q)
    );
  });

  const pendingCount = rows.filter((r) => r.status === "REQUESTED").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">উইথড্রয়াল</h1>
        <p className="text-sm text-muted-foreground">
          মোট {total} টি রিকোয়েস্ট · {pendingCount} টি নতুন
        </p>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">সকল উইথড্রয়াল</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="খুঁজুন (মোবাইল, নাম, Txn)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[220px]"
              />
              <Select
                value={filterStatus}
                onValueChange={(v) => setFilterStatus(v as FilterStatus)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সকল</SelectItem>
                  <SelectItem value="REQUESTED">অনুরোধ</SelectItem>
                  <SelectItem value="APPROVED">অনুমোদিত</SelectItem>
                  <SelectItem value="PAID">পরিশোধিত</SelectItem>
                  <SelectItem value="REJECTED">প্রত্যাখ্যাত</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={5} />
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              কোনো উইথড্রয়াল নেই
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ব্যবহারকারী</TableHead>
                    <TableHead>মেথড</TableHead>
                    <TableHead>পরিমাণ</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead className="text-right">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">
                            {row.user?.name ?? "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {row.user?.mobile} → {row.destinationNumber}
                          </p>
                          {row.fraudFlag ? (
                            <p className="text-xs text-amber-600">
                              ফ্রড ফ্ল্যাগ
                              {row.fraudReason ? `: ${row.fraudReason}` : ""}
                            </p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {METHOD_BN[row.method]}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatBdt(row.amountMinorUnits)}
                      </TableCell>
                      <TableCell>{statusBadge(row.status)}</TableCell>
                      <TableCell className="text-xs">
                        {formatDate(row.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.status === "REQUESTED" ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600"
                              onClick={() => openReview(row, "approve")}
                            >
                              <CheckCircle className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500"
                              onClick={() => openReview(row, "reject")}
                            >
                              <XCircle className="size-4" />
                            </Button>
                          </div>
                        ) : row.status === "APPROVED" ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openReview(row, "pay")}
                            >
                              পরিশোধ
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500"
                              onClick={() => openReview(row, "reject")}
                            >
                              <XCircle className="size-4" />
                            </Button>
                          </div>
                        ) : row.paidTrxId ? (
                          <span className="font-mono text-xs">{row.paidTrxId}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
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

      <Dialog
        open={review !== null}
        onOpenChange={(open) => {
          if (!open) setReview(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approve"
                ? "উইথড্রয়াল অনুমোদন"
                : reviewAction === "pay"
                  ? "পরিশোধ হিসেবে মার্ক"
                  : "উইথড্রয়াল প্রত্যাখ্যান"}
            </DialogTitle>
          </DialogHeader>
          {review ? (
            <div className="space-y-4">
              <div className="space-y-1 rounded border p-3 text-sm">
                <p>
                  <strong>ব্যবহারকারী:</strong> {review.user?.name} (
                  {review.user?.mobile})
                </p>
                <p>
                  <strong>পাঠাবেন:</strong> {METHOD_BN[review.method]} —{" "}
                  {review.destinationNumber}
                </p>
                <p>
                  <strong>পরিমাণ:</strong> {formatBdt(review.amountMinorUnits)}
                </p>
              </div>
              {reviewAction === "pay" ? (
                <div>
                  <Label htmlFor="paidTrxId">পেমেন্ট Txn ID</Label>
                  <Input
                    id="paidTrxId"
                    value={paidTrxId}
                    onChange={(e) => setPaidTrxId(e.target.value)}
                    placeholder="bKash / Nagad trx id"
                  />
                </div>
              ) : null}
              <div>
                <Label htmlFor="adminNote">অ্যাডমিন নোট (ঐচ্ছিক)</Label>
                <Textarea
                  id="adminNote"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="min-h-[60px] resize-none"
                />
              </div>
              <Button
                onClick={handleReview}
                disabled={submitting}
                variant={reviewAction === "reject" ? "destructive" : "default"}
                className="w-full"
              >
                {submitting
                  ? "প্রসেসিং..."
                  : reviewAction === "approve"
                    ? "অনুমোদন করুন"
                    : reviewAction === "pay"
                      ? "পরিশোধ মার্ক করুন"
                      : "প্রত্যাখ্যান করুন"}
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
