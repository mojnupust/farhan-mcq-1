import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatBdt } from "@/features/wallet";
import { Flame, Loader2 } from "lucide-react";

import type { StreakStatus } from "../types";

const BADGE_BN: Record<string, string> = {
  Rookie: "রুকি",
  Hustler: "হাসলার",
  Earner: "আর্নার",
  Legend: "লিজেন্ড",
};

export function StreakCard({
  status,
  checkingIn,
  onCheckIn,
}: {
  status: StreakStatus;
  checkingIn: boolean;
  onCheckIn: () => void;
}) {
  return (
    <Card className="overflow-hidden border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:border-orange-900 dark:from-orange-950/40 dark:to-amber-950/20">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-md">
            <Flame className="size-8" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">আজকের স্ট্রিক</p>
            <p className="text-3xl font-bold leading-none">
              {status.currentDay}
              <span className="ml-1 text-base font-medium text-muted-foreground">
                / {status.cap} দিন
              </span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              ব্যাজ: {BADGE_BN[status.badgeLevel] ?? status.badgeLevel}
              {status.isPremium ? " · প্রিমিয়াম" : " · ফ্রি"}
              {" · "}সেরা {status.longestStreak} দিন
            </p>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:min-w-48">
          {status.todayDone ? (
            <Button disabled className="w-full">
              আজকের চেক-ইন হয়েছে
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={onCheckIn}
              disabled={checkingIn}
            >
              {checkingIn ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              চেক-ইন করুন · {formatBdt(status.nextRewardMinorUnits)}
            </Button>
          )}
          {!status.todayDone && status.gate.required && !status.gate.passed ? (
            <p className="text-center text-xs text-amber-700 dark:text-amber-300">
              আগে আজকের কুইজ শেষ করুন (
              {status.gate.progress.answeredCount}/
              {status.gate.progress.minQuestions} প্রশ্ন)
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
