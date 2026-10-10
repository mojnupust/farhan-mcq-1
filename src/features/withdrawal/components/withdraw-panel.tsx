"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { formatBdt } from "@/features/wallet";
import { Banknote, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { METHOD_BN, STATUS_BN } from "../labels";
import { withdrawalService } from "../services/withdrawal.api";
import type {
  PayoutMethod,
  WithdrawalEligibility,
  WithdrawalRequest,
} from "../types";

function statusBadge(status: WithdrawalRequest["status"]) {
  if (status === "PAID") return <Badge>পরিশোধিত</Badge>;
  if (status === "REJECTED")
    return <Badge variant="destructive">{STATUS_BN[status]}</Badge>;
  if (status === "APPROVED")
    return <Badge variant="default">{STATUS_BN[status]}</Badge>;
  return <Badge variant="outline">{STATUS_BN[status]}</Badge>;
}

export function WithdrawPanel({ onWalletChange }: { onWalletChange: () => void }) {
  const [eligibility, setEligibility] = useState<WithdrawalEligibility | null>(
    null,
  );
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [open, setOpen] = useState(false);
  const [amountBdt, setAmountBdt] = useState("");
  const [method, setMethod] = useState<PayoutMethod>("BKASH");
  const [destination, setDestination] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const [elig, list] = await Promise.all([
      withdrawalService.eligibility(),
      withdrawalService.listMine(),
    ]);
    setEligibility(elig);
    setHistory(list.data);
    setDestination(elig.userMobile);
  }, []);

  useEffect(() => {
    load().catch(() => toast.error("উইথড্রয়াল তথ্য লোড হয়নি"));
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!eligibility) return;
    const taka = Number(amountBdt);
    if (!Number.isFinite(taka) || taka <= 0) {
      toast.error("সঠিক পরিমাণ লিখুন");
      return;
    }
    setSubmitting(true);
    try {
      await withdrawalService.request({
        amountMinorUnits: Math.round(taka * 100),
        method,
        destinationNumber: destination,
        idempotencyKey: `withdraw:${crypto.randomUUID()}`,
      });
      toast.success("উইথড্রয়াল অনুরোধ পাঠানো হয়েছে");
      setOpen(false);
      setAmountBdt("");
      await load();
      onWalletChange();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "অনুরোধ হয়নি");
    } finally {
      setSubmitting(false);
    }
  }

  const canRequest =
    eligibility &&
    !eligibility.hasPending &&
    eligibility.availableMinorUnits >= eligibility.minMinorUnits;

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Banknote className="size-4" />
            উইথড্রয়াল
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">উত্তোলনযোগ্য</p>
              <p className="text-xl font-semibold">
                {formatBdt(eligibility?.availableMinorUnits ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground">
                সর্বনিম্ন {formatBdt(eligibility?.minMinorUnits ?? 0)}
                {eligibility?.hasPending ? " · একটি রিকোয়েস্ট পেন্ডিং" : ""}
              </p>
            </div>
            <Button
              onClick={() => setOpen(true)}
              disabled={!canRequest}
              variant="outline"
            >
              টাকা তুলুন
            </Button>
          </div>

          {history.length > 0 ? (
            <ul className="divide-y rounded-lg border">
              {history.map((row) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {formatBdt(row.amountMinorUnits)} · {METHOD_BN[row.method]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.destinationNumber}
                      {row.paidTrxId ? ` · Txn ${row.paidTrxId}` : ""}
                    </p>
                  </div>
                  {statusBadge(row.status)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              এখনো কোনো উইথড্রয়াল নেই।
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>টাকা তুলুন</DialogTitle>
              <DialogDescription>
                বিকাশ, নগদ বা রকেটে পাঠানো হবে। অ্যাডমিন অনুমোদনের পর পরিশোধ
                হবে।
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1.5">
              <Label htmlFor="wd-amount">পরিমাণ (টাকা)</Label>
              <Input
                id="wd-amount"
                type="number"
                min={1}
                step="1"
                value={amountBdt}
                onChange={(e) => setAmountBdt(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>মেথড</Label>
              <Select
                value={method}
                onValueChange={(v) => setMethod(v as PayoutMethod)}
              >
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

            <div className="space-y-1.5">
              <Label htmlFor="wd-dest">মোবাইল নম্বর</Label>
              <Input
                id="wd-dest"
                inputMode="numeric"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                disabled={eligibility?.requiresVerifiedPhone}
                required
              />
              {eligibility?.requiresVerifiedPhone ? (
                <p className="text-xs text-muted-foreground">
                  ভেরিফায়েড অ্যাকাউন্ট নম্বরেই পাঠানো হবে
                </p>
              ) : null}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                বাতিল
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                অনুরোধ পাঠান
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
