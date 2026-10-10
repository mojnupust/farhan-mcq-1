import { formatBdt } from "@/features/wallet";
import { Check } from "lucide-react";
import type { DayCell } from "../types";

export function StreakGrid({
  grid,
  todayDone,
}: {
  grid: DayCell[];
  todayDone: boolean;
}) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-10">
      {grid.map((cell) => {
        const isToday = cell.state === "today";
        const isDone = cell.state === "done" || (isToday && todayDone);
        const isLocked = cell.state === "locked";
        return (
          <div
            key={cell.day}
            className={`flex flex-col items-center rounded-xl border px-1 py-2 text-center ${
              isDone
                ? "border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-100"
                : isToday
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted/40 text-muted-foreground"
            }`}
          >
            <span className="text-[10px] font-medium">দিন {cell.day}</span>
            {isDone ? (
              <Check className="mt-1 size-4" />
            ) : (
              <span className="mt-1 text-[10px] leading-tight">
                {formatBdt(cell.amountMinorUnits)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
