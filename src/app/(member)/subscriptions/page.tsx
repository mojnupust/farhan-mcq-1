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
import { subscriptionService, useSubscription } from "@/features/subscriptions";
import type {
  PackageDto,
  PaymentTransactionDto,
} from "@/features/subscriptions/types";
import { Package, Send, Trash2 } from "lucide-react";
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

export default function SubscriptionsPage() {
  const [packages, setPackages] = useState<PackageDto[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransactionDto[]>([]);
  const { activePackage, refresh: refreshSubscription } = useSubscription();
  const [loading, setLoading] = useState(true);

  // Payment dialog
  const [selectedPkg, setSelectedPkg] = useState<PackageDto | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("BKASH");
  const [mobileNumber, setMobileNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pkgs, txns] = await Promise.all([
        subscriptionService.getPackages(),
        subscriptionService.getMyTransactions(),
      ]);
      setPackages(pkgs);
      setTransactions(txns);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg) return;
    setSubmitting(true);
    try {
      await subscriptionService.submitPayment({
        packageId: selectedPkg.id,
        amount: selectedPkg.price - selectedPkg.discount,
        paymentMethod: paymentMethod as "BKASH" | "NAGAD" | "ROCKET",
        mobileNumber,
        transactionId,
      });
      setSelectedPkg(null);
      setMobileNumber("");
      setTransactionId("");
      await Promise.all([loadData(), refreshSubscription()]);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "পেমেন্ট সাবমিট ব্যর্থ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("এই ট্রানজাকশন মুছে ফেলতে চান?")) return;
    try {
      await subscriptionService.deleteTransaction(id);
      await loadData();
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : "শুধুমাত্র পেন্ডিং ট্রানজাকশন মুছে ফেলা যায়",
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">সাবস্ক্রিপশন</h1>
      <p className="text-sm text-muted-foreground">
        প্যাকেজ কিনুন এবং পেমেন্ট ট্র্যাক করুন
      </p>

      {/* Active Package */}
      {activePackage && (
        <Card className="mt-6 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Package className="size-5 text-green-600" />
              <div>
                <p className="font-medium">
                  সক্রিয় প্যাকেজ: {activePackage.packageName}
                </p>
                <p className="text-sm text-muted-foreground">
                  মেয়াদ: {formatDate(activePackage.startDate)} —{" "}
                  {formatDate(activePackage.endDate)}
                  {activePackage.packageLiveQuota && (
                    <span>
                      {" "}
                      · লাইভ: {activePackage.liveUsed}/
                      {activePackage.packageLiveQuota}
                    </span>
                  )}
                  {activePackage.packageArchiveQuota && (
                    <span>
                      {" "}
                      · আর্কাইভ: {activePackage.archiveUsed}/
                      {activePackage.packageArchiveQuota}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Package Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{pkg.name}</CardTitle>
              {pkg.description && (
                <p className="text-sm text-muted-foreground">
                  {pkg.description}
                </p>
              )}
            </CardHeader>
            <CardContent className="mt-auto space-y-3">
              <div>
                <div className="flex items-baseline gap-2">
                  {pkg.discount > 0 ? (
                    <>
                      <span className="text-2xl font-bold">
                        ৳{pkg.price - pkg.discount}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        ৳{pkg.price}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold">৳{pkg.price}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {pkg.durationDays} দিন
                  {pkg.liveQuota && ` · লাইভ ${pkg.liveQuota}টি`}
                  {pkg.archiveQuota && ` · আর্কাইভ ${pkg.archiveQuota}টি`}
                </p>
              </div>
              <Button className="w-full" onClick={() => setSelectedPkg(pkg)}>
                <Send className="size-4 mr-1" />
                কিনুন
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transaction History */}
      {transactions.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">পেমেন্ট ইতিহাস</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TXN ID</TableHead>
                  <TableHead>প্যাকেজ</TableHead>
                  <TableHead>পেমেন্ট</TableHead>
                  <TableHead>পরিমাণ</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                  <TableHead>তারিখ</TableHead>
                  <TableHead className="text-right">অ্যাকশন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-mono text-xs">
                      {txn.transactionId}
                    </TableCell>
                    <TableCell className="text-sm">{txn.packageName}</TableCell>
                    <TableCell className="text-sm">
                      {methodLabel(txn.paymentMethod)}
                    </TableCell>
                    <TableCell className="font-medium">৳{txn.amount}</TableCell>
                    <TableCell>{statusBadge(txn.status)}</TableCell>
                    <TableCell className="text-xs">
                      {formatDate(txn.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {txn.status === "PENDING" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTransaction(txn.id)}
                        >
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
                      ) : txn.adminNote ? (
                        <span className="text-xs text-muted-foreground">
                          {txn.adminNote}
                        </span>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Payment Dialog */}
      <Dialog
        open={selectedPkg !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedPkg(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>পেমেন্ট সাবমিট করুন</DialogTitle>
          </DialogHeader>
          {selectedPkg && (
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div className="rounded border p-3 text-sm space-y-1">
                <p>
                  <strong>প্যাকেজ:</strong> {selectedPkg.name}
                </p>
                <p>
                  <strong>পরিমাণ:</strong> ৳
                  {selectedPkg.price - selectedPkg.discount}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  নিচের যেকোনো একটি মাধ্যমে উক্ত পরিমাণ পাঠান, তারপর ট্রানজাকশন
                  আইডি এখানে সাবমিট করুন।
                </p>
              </div>

              <div>
                <Label htmlFor="paymentMethod">পেমেন্ট মাধ্যম</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BKASH">বিকাশ</SelectItem>
                    <SelectItem value="NAGAD">নগদ</SelectItem>
                    <SelectItem value="ROCKET">রকেট</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mobileNumber">প্রেরক মোবাইল নম্বর</Label>
                <Input
                  id="mobileNumber"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  required
                  minLength={11}
                />
              </div>

              <div>
                <Label htmlFor="txnId">ট্রানজাকশন আইডি</Label>
                <Input
                  id="txnId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="TXN8A2K9F1"
                  required
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "সাবমিট হচ্ছে..." : "পেমেন্ট সাবমিট করুন"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
