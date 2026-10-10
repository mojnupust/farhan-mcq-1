"use client";

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
import { ContentSkeleton } from "@/components/ui/loading-skeleton";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/features/auth";
import { StreakCard } from "@/features/streak/components/streak-card";
import { StreakGrid } from "@/features/streak/components/streak-grid";
import {
  ActivityRequiredError,
  streakService,
  type CheckInResult,
  type StreakStatus,
} from "@/features/streak";
import { formatBdt, walletService, type WalletAccount } from "@/features/wallet";
import { WithdrawPanel } from "@/features/withdrawal/components/withdraw-panel";
import { Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function EarnPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<StreakStatus | null>(null);
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [showLost, setShowLost] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    const [s, w] = await Promise.all([
      streakService.getStatus(),
      walletService.getMine(),
    ]);
    setStatus(s);
    setWallet(w);
    if (s.streakLostNotice) setShowLost(true);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?next=/earn");
      return;
    }
    setLoadError(false);
    load()
      .catch(() => {
        setLoadError(true);
        toast.error("স্ট্রিক লোড করা যায়নি");
      })
      .finally(() => setLoading(false));
  }, [authLoading, user, load, router]);

  async function handleCheckIn() {
    if (!status) return;
    if (status.gate.required && !status.gate.passed) {
      setShowGate(true);
      return;
    }
    setCheckingIn(true);
    try {
      const data = await streakService.checkIn();
      setResult(data);
      await load();
    } catch (err) {
      if (err instanceof ActivityRequiredError) {
        setShowGate(true);
      } else {
        toast.error(err instanceof Error ? err.message : "চেক-ইন হয়নি");
      }
    } finally {
      setCheckingIn(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <ContentSkeleton />
      </div>
    );
  }

  if (loadError || !status) {
    return (
      <div className="mx-auto max-w-4xl space-y-3 px-4 py-6 sm:px-6">
        <p className="text-sm text-muted-foreground">স্ট্রিক লোড করা যায়নি।</p>
        <Button
          onClick={() => {
            setLoading(true);
            setLoadError(false);
            load()
              .catch(() => {
                setLoadError(true);
                toast.error("স্ট্রিক লোড করা যায়নি");
              })
              .finally(() => setLoading(false));
          }}
        >
          আবার চেষ্টা
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">আয় করুন</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          প্রতিদিন চেক-ইন করে পয়সা জমান — ধারাবাহিক অনুশীলনই পুরস্কার।
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="size-4" />
            ওয়ালেট
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-bold">
              {formatBdt(wallet?.availableMinorUnits ?? 0)}
            </p>
            {(wallet?.lockedMinorUnits ?? 0) > 0 ? (
              <p className="text-xs text-muted-foreground">
                লক: {formatBdt(wallet!.lockedMinorUnits)}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <WithdrawPanel
        onWalletChange={() => {
          walletService.getMine().then(setWallet).catch(() => undefined);
        }}
      />

      <StreakCard
        status={status}
        checkingIn={checkingIn}
        onCheckIn={handleCheckIn}
      />

      <div>
        <h2 className="mb-3 text-sm font-semibold">
          {status.isPremium ? "৬০ দিনের সাইকেল" : "৩০ দিনের সাইকেল"}
        </h2>
        <StreakGrid grid={status.grid} todayDone={status.todayDone} />
      </div>

      <Dialog open={Boolean(result)} onOpenChange={() => setResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {result?.cycleCompleted
                ? "সাইকেল সম্পন্ন!"
                : result?.alreadyDone
                  ? "আজকের চেক-ইন আগেই হয়েছে"
                  : `দিন ${result?.checkIn.dayNumber} সম্পন্ন`}
            </DialogTitle>
            <DialogDescription>
              {result?.checkIn.rewardStatus === "QUEUED"
                ? "এই মাসের বাজেট শেষ — রিওয়ার্ড কিউতে রাখা হয়েছে।"
                : `${formatBdt(result?.checkIn.rewardMinorUnits ?? 0)} ওয়ালেটে যোগ হয়েছে।`}
              {result?.checkIn.usedFreeze
                ? " একটি ফ্রিজ ব্যবহার করে স্ট্রিক বাঁচানো হয়েছে।"
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setResult(null)}>ঠিক আছে</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLost} onOpenChange={setShowLost}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>স্ট্রিক হারিয়েছেন</DialogTitle>
            <DialogDescription>
              একদিন মিস হওয়ায় স্ট্রিক রিসেট হয়েছে। আজ থেকে আবার শুরু করুন।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowLost(false)}>আবার শুরু করি</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showGate} onOpenChange={setShowGate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>আগে কুইজ সম্পন্ন করুন</DialogTitle>
            <DialogDescription>
              চেক-ইনের আগে অন্তত {status.gate.progress.minQuestions}টি প্রশ্ন
              উত্তর দিন এবং {status.gate.progress.minSeconds} সেকেন্ড অনুশীলন
              করুন। এখন{" "}
              {status.gate.progress.answeredCount}/
              {status.gate.progress.minQuestions} প্রশ্ন হয়েছে।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGate(false)}>
              পরে
            </Button>
            <Button asChild>
              <Link href={ROUTES.exams}>পরীক্ষায় যান</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
